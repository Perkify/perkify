import Stripe from 'stripe';
import { stripeWebhookSecret } from '../../configs';
import { db, stripe } from '../../models';
import {
  handleError,
  syncUsersWithBusinessDocumentPerkGroupDelayed,
} from '../../utils';
import { handleAuthorizationRequest } from './handleAuthorizationRequest';

export const stripeWebhooks = async (request, response, next) => {
  const sig = request.headers['stripe-signature'];

  let event;

  // Verify webhook signature and extract the event.
  try {
    event = stripe.webhooks.constructEvent(
      request.rawBody,
      sig,
      stripeWebhookSecret
    );
  } catch (err) {
    console.log(err);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'issuing_authorization.request') {
      const auth = event.data.object;
      await handleAuthorizationRequest(auth);
    } else if (event.type === 'invoice.paid') {
      // get the invoice object
      const invoice = event.data.object as Stripe.Invoice;

      // get the expanded invoice object
      const expandedInvoice = await stripe.invoices.retrieve(invoice.id, {
        expand: ['payment_intent', 'subscription', 'customer'],
      });
      const paymentIntent =
        expandedInvoice.payment_intent as Stripe.PaymentIntent;
      const subscription = expandedInvoice.subscription as Stripe.Subscription;

      if (
        !paymentIntent ||
        paymentIntent == undefined ||
        paymentIntent.charges.data.length == 0
      ) {
        console.error('Invoice does not have payment intent / any charges');
        return;
      }

      const charge = paymentIntent.charges.data[0];

      const balanceTransaction = await stripe.balanceTransactions.retrieve(
        charge.balance_transaction as string
      );

      // get the time that the money will be available!

      const expirationAtSeconds = balanceTransaction.available_on;

      if (!subscription) {
        // don't handle invoices unless they are associated with a subscription
        return;
      }

      const businessID = subscription.metadata['businessID'];
      const businessData = (
        await db.collection('businesses').doc(businessID).get()
      ).data() as Business;

      if (invoice.metadata) {
        const perkGroupName = invoice.metadata['perkGroupName'];

        // create task in queue
        await syncUsersWithBusinessDocumentPerkGroupDelayed(
          {
            businessID,
            perkGroupName: perkGroupName,
            perkGroupData: businessData.groups[perkGroupName],
          },
          expirationAtSeconds
        );
      } else {
        const subscriptionCreatedDate = new Date(subscription.created * 1000);
        const presentDate = new Date();

        const minutesSinceCreation =
          Math.abs(presentDate.getTime() - subscriptionCreatedDate.getTime()) /
          1000 /
          60;

        // payment failing is going to be a hassle maybe hopefully not
        if (minutesSinceCreation < 60) {
          // created less than a day ago
          // so this corresponds to a creation
        } else {
          // renewal so don't do anything
          const perkGroupNames = Object.keys(businessData.groups);
          if (perkGroupNames.length != 1) {
            throw new Error(
              'Expected perk group names length to be 1 upon creation of subscription'
            );
          }

          const perkGroupName = perkGroupNames[0];

          // create task in queue
          await syncUsersWithBusinessDocumentPerkGroupDelayed(
            {
              businessID,
              perkGroupName: perkGroupName,
              perkGroupData: businessData.groups[perkGroupName],
            },
            expirationAtSeconds
          );
        }

        // if created for the first time, a single perk group will have been created

        // unknown: how does it work when subscription changes
        // does the metadata for the webhook get updated
        // you would think that the metadata with the webhook is the most recent information
        // not the information from when the event was created.

        // wait a second, I could attach the invoice.
        // The webhook will be called as soon as the payment goes through successfully
        // then I lock it away until the available date
        // so I should just update the subscription, and associate the invoice
        // and then read from the subscription metadata
        // sweet
        // and then for renewals at the end of the month
        // the subscription is renewed at its last price
        // the thing is we don't want to make any changes during renewals

        // schedule a change
        // wait a second, the subscription will have the full data attached, not just the changed perk group
      }
    }
  } catch (err) {
    handleError(err, response);
  }

  response.json({ received: true });
};
