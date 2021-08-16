import Stripe from 'stripe';
import { stripeWebhookSecret } from '../../../configs';
import {
  db,
  firebaseFunctionsUrl,
  functions,
  queuePath,
  stripe,
  tasksClient,
} from '../../../models';
import { handleError } from '../../../utils';

const addTaskToExpandUsersQueue = async (payload, expirationAtSeconds) => {
  // get the webhook endpoint to call
  const url = firebaseFunctionsUrl + '/syncUsersWithBusinessDocumentPerkGroup';

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
  const business = (
    await db.collection('businesses').doc(businessID).get()
  ).data() as Business;

  if (invoice.metadata) {
    // this is a modified subscription because the invoice has metadata

    // generate the payload
    const payload = { business };

    // create task in queue
    await addTaskToExpandUsersQueue(payload, expirationAtSeconds);
  } else {
    // this is not a subscription because the invoice does not have metadata

    // calculate minutes since webhook creation
    const subscriptionCreatedDate = new Date(subscription.created * 1000);
    const presentDate = new Date();
    const minutesSinceCreation =
      Math.abs(presentDate.getTime() - subscriptionCreatedDate.getTime()) /
      1000 /
      60;

    if (minutesSinceCreation < 60) {
      // created less than a day ago
      // so this corresponds to a subscription creation

      const perkGroupNames = Object.keys(business.perkGroups);
      if (perkGroupNames.length != 1) {
        throw new Error(
          'Expected perk group names length to be 1 upon creation of subscription'
        );
      }

      // generate the payload
      const payload = { business };

      // create task in queue
      await addTaskToExpandUsersQueue(payload, expirationAtSeconds);
    } else {
      // created over a day ago
      // so corresponds to a subscription renewal
      // renewal so we want to credit the user in 2 days
    }
  }
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
        stripeWebhookSecret
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
      handleError(err, response);
    }

    response.json({ received: true });
  }
);
