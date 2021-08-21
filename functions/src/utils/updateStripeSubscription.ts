import { logger } from 'firebase-functions';
import { allPerksDict, taxRates } from '../../shared';
import { db, stripe } from '../services';
import { Subscription } from '../types';
import { shrinkUsers } from './crudHelpers';

// we want to call this anytime we modify a stripe subscription
// takes the business definition and updates the relevant stripe subscription

// update stripe subscription with business perkGroups
export const updateStripeSubscription = async (businessID: string) => {
  const businessData = (
    await db.collection('businesses').doc(businessID).get()
  ).data() as Business;

  if (businessData == null) {
    throw new Error('Missing business document in firestore');
  }

  // remove stuff that shouldn't exist from 'users'
  await shrinkUsers(businessData);

  const quantityByPriceID = Object.keys(businessData.perkGroups).reduce(
    (accumulator, perkGroupName) => {
      businessData.perkGroups[perkGroupName].perkNames.forEach((perkName) => {
        if (accumulator[allPerksDict[perkName].stripePriceId]) {
          accumulator[allPerksDict[perkName].stripePriceId] +=
            businessData.perkGroups[perkGroupName].emails.length;
        } else {
          accumulator[allPerksDict[perkName].stripePriceId] =
            businessData.perkGroups[perkGroupName].emails.length;
        }
      });
      return accumulator;
    },
    {} as { [key: string]: number }
  );

  const numEmployees = Object.values(businessData.perkGroups).reduce(
    (acc, perkGroup) => acc + perkGroup.emails.length,
    0
  );

  // convert the count of each perk to a list of items
  const newSubscriptionItemsList = (
    Object.keys(quantityByPriceID).map((priceID) => ({
      price: priceID,
      quantity: quantityByPriceID[priceID],
    })) as {
      price: string;
      quantity: number;
      id?: string;
      taxRates?: string[];
    }[]
  ).concat([
    // add the perkify cost per employee with no tax rate
    {
      price: allPerksDict['Perkify Cost Per Employee'].stripePriceId,
      quantity: numEmployees,
      taxRates: [],
    },
  ]);

  // check if the customer has an existing active subscriptions
  const subscriptionsSnapshot = await db
    .collection('businesses')
    .doc(businessID)
    .collection('subscriptions')
    .get();

  const subscriptionItem = subscriptionsSnapshot.docs.filter(
    (doc) => doc.data().canceled_at == null
  )?.[0];

  if (!(subscriptionItem && subscriptionItem.exists)) {
    // the admin doesn't have any subscriptions
    // create a subscription for them
    await stripe.subscriptions.create({
      customer: businessData.stripeId,
      items: newSubscriptionItemsList,
      default_tax_rates: [taxRates.perkifyTax.stripeTaxID],
    });
  } else {
    // the admin is already subscribed
    // update the subscription to reflect the new item quantities
    // add item ids to existing subscriptions prices

    // const subscriptionID = subscriptionItem.id;
    const subscriptionObject = subscriptionItem.data() as Subscription;

    // this isn't going to work...
    // need to actually take the diff at the employee email level
    // in order to calculate what's increasing vs going down
    // but we aren't storing that data yet
    // so the work around is to assume that there are no intra
    // perk group changes for now
    // so for now check if everything went up or everything went down
    // if everything went down, remove from subscription but do not prorate
    const oldQuantityByPriceID = subscriptionObject.items.reduce(
      (accumulator, item) => {
        accumulator[item.price.id] = item.quantity || 0;
        return accumulator;
      },
      {} as { [key: string]: number }
    );

    for (let i = 0; i < newSubscriptionItemsList.length; i++) {
      newSubscriptionItemsList[i]['id'] = subscriptionObject.items.filter(
        (item: { price: { id: string } }) =>
          item.price.id == newSubscriptionItemsList[i].price
      )?.[0]?.id;
    }

    const priceIDs = Object.keys(quantityByPriceID).concat(
      Object.keys(oldQuantityByPriceID)
    );

    const isSubscriptionIncrease = priceIDs.every(
      (priceID) =>
        quantityByPriceID[priceID] || 0 >= oldQuantityByPriceID[priceID] || 0
    );

    const isSubscriptionDecrease = priceIDs.every(
      (priceID) =>
        quantityByPriceID[priceID] || 0 <= oldQuantityByPriceID[priceID] || 0
    );

    if (isSubscriptionIncrease) {
      // update the subscription and charge the customer

      await stripe.subscriptions.update(subscriptionItem.id, {
        items: newSubscriptionItemsList,
        proration_behavior: 'always_invoice',
      });

      // invoice is already paid error

      // // create an invoice to charge the difference of the subscription
      // const createdInvoice = await stripe.invoices.create({
      //   customer: businessData.stripeId,
      //   // auto_advance: true,
      //   collection_method: 'charge_automatically',
      //   subscription: subscriptionID,
      // });

      // // finalize the invoice
      // await stripe.invoices.finalizeInvoice(createdInvoice.id, {
      //   // auto_advance: true,
      // });

      // // pay the invoice
      // await stripe.invoices.pay(createdInvoice.id, {
      //   // auto_advance: true,
      // });
    } else if (isSubscriptionDecrease) {
      // update the subscription, don't give anything back

      await stripe.subscriptions.update(subscriptionItem.id, {
        items: newSubscriptionItemsList,
        proration_behavior: 'none',
      });
    } else {
      logger.error(
        'Should not have simultaneous subscription increase and decrease',
        businessData,
        quantityByPriceID
      );
    }
  }
};
