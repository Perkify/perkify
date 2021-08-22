import { logger } from 'firebase-functions';
import Stripe from 'stripe';
import { expandUsers } from '../../../utils';
import {
  firebaseFunctionsUrl,
  functions,
  queuePath,
  stripe,
  tasksClient,
} from '../services';

const addTaskToExpandUsersQueue = async (
  payload: ExpandUsersPayload,
  availableOn: number
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
      seconds: availableOn,
    },
  };
  await tasksClient.createTask({ parent: queuePath, task });
};

export const propogateSubscriptionUpdateToLiveUsers = async (
  businessData: Business,
  subscription: Stripe.Subscription
) => {
  // expand the most recent invoice
  const expandedInvoice = await stripe.invoices.retrieve(
    subscription.latest_invoice as string,
    {
      expand: ['payment_intent'],
    }
  );

  const paymentIntent = expandedInvoice.payment_intent as Stripe.PaymentIntent;

  if (
    !paymentIntent ||
    paymentIntent == undefined ||
    paymentIntent.charges.data.length == 0
  ) {
    logger.error('Invoice does not have payment intent / any charges');
    return;
  }

  // get the balance transaction
  const charge = paymentIntent.charges.data[0];
  const balanceTransaction = await stripe.balanceTransactions.retrieve(
    charge.balance_transaction as string
  );

  // get the time that the money will be available
  const availableOn = balanceTransaction.available_on;

  if (functions.config()['stripe-firebase'].environment == 'production') {
    // create task in queue

    // generate the payload
    const payload = { business: businessData };
    await addTaskToExpandUsersQueue(payload, availableOn);
  } else {
    await expandUsers(businessData);
  }
};
