import Stripe from 'stripe';
import { invoicePaidWebhookStripeSecret } from '../../../configs';
import {
  db,
  firebaseFunctionsUrl,
  functions,
  queuePath,
  stripe,
  tasksClient,
} from '../../../services';
import { errorHandler } from '../../../utils';

const addTaskToExpandUsersQueue = async (
  payload: ExpandUsersPayload,
  expirationAtSeconds: number
) => {
  // get the webhook endpoint to call
  const url = firebaseFunctionsUrl + '/expandUsersWebhookHandler';

  const task = {
    httpRequest: {
      httpMethod: 'POST' as const,
      url,
      body: Buffer.from(JSON.stringify(payload)).toString('base64'),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    scheduleTime: {
      seconds: expirationAtSeconds,
    },
  };
  await tasksClient.createTask({ parent: queuePath, task });
};

const propogateInvoice = async (invoice: Stripe.Invoice) => {
  // get the expanded invoice object
  const expandedInvoice = await stripe.invoices.retrieve(invoice.id, {
    expand: ['payment_intent', 'subscription', 'customer'],
  });
  const paymentIntent = expandedInvoice.payment_intent as Stripe.PaymentIntent;
  const subscription = expandedInvoice.subscription as Stripe.Subscription;

  if (
    !paymentIntent ||
    paymentIntent == undefined ||
    paymentIntent.charges.data.length == 0
  ) {
    console.error('Invoice does not have payment intent / any charges');
    return;
  }

  if (!subscription) {
    // don't handle invoices unless they are associated with a subscription
    console.error('No subscription attached to the invoice');
    return;
  }

  // get the balance transaction
  const charge = paymentIntent.charges.data[0];
  const balanceTransaction = await stripe.balanceTransactions.retrieve(
    charge.balance_transaction as string
  );

  // get the time that the money will be available
  const expirationAtSeconds = balanceTransaction.available_on;

  // get the business data to be applied when the invoice becomes available
  const businessID = subscription.metadata['businessID'];

  // what if business is undefined?
  // the "as Business" hides this fact
  // should use some sort of helper method for getting the business
  // or throwing an error if it doesn't exist
  const business = (
    await db.collection('businesses').doc(businessID).get()
  ).data() as Business;

  // generate the payload
  const payload = { business };

  // create task in queue
  await addTaskToExpandUsersQueue(payload, expirationAtSeconds);
};

export const invoicePaidWebhookHandler = functions.https.onRequest(
  async (request, response) => {
    const sig = request.headers['stripe-signature'];

    if (!sig) {
      response.status(400).send(`Stripe signature missing`);
      return;
    }

    let event: Stripe.Event;

    // Verify webhook signature and extract the event.
    try {
      event = stripe.webhooks.constructEvent(
        request.rawBody,
        sig,
        invoicePaidWebhookStripeSecret
      );
    } catch (err) {
      console.log(err);
      response.status(401).send(`Webhook Error: ${err.message}`);
      return;
    }

    try {
      if (event.type === 'invoice.paid') {
        // get the invoice object
        const invoice = event.data.object as Stripe.Invoice;

        // propogate the invoice to the user collection
        await propogateInvoice(invoice);
      }
    } catch (err) {
      errorHandler(err, request, response);
    }

    response.json({ received: true });
  }
);
