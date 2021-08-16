import { allPerksDict } from '../../shared';
import { db, stripe } from '../models';
import { shrinkUsers } from './shrinkUsers';

// takes an admin id and business id
// updates the stripe subscription to match the perks and employees in the business document
// to be used after making an update to a single perk group
// must be called separately for each updated perk group

// we want to call this anytime we modify a stripe subscription

// update stripe subscription with business perks
export const updateStripeSubscription = async (businessID: string) => {
  // get business data
  const business = (
    await db.collection('businesses').doc(businessID).get()
  ).data() as Business;

  if (!business) {
    const error = {
      status: 500,
      reason: 'Missing document',
      reasonDetail: 'Could not find business data document',
    };
    throw error;
  }

  // remove stuff that shouldn't exist from 'users'
  await shrinkUsers(business);

  const perkCountsByName = Object.keys(business.groups).reduce(
    (accumulator, perkGroupName) => {
      business.groups[perkGroupName].perks.forEach((perkName) => {
        if (accumulator[perkName]) {
          accumulator[perkName] +=
            business.groups[perkGroupName].employees.length;
        } else {
          accumulator[perkName] =
            business.groups[perkGroupName].employees.length;
        }
      });
      return accumulator;
    },
    {}
  );

  // convert the count of each perk to a list of items
  const newSubscriptionItemsList = Object.keys(perkCountsByName).map(
    (perkName) => ({
      price: allPerksDict[perkName].stripePriceId,
      quantity: perkCountsByName[perkName],
    })
  );

  // check if the customer has an existing active subscriptions
  const subscriptionsSnapshot = await db
    .collection('businesses')
    .doc(businessID)
    .collection('subscriptions')
    .get();

  const subscriptionItem = subscriptionsSnapshot.docs.filter(
    (doc) => doc.data().canceled_at == null
  );

  if (subscriptionItem.length == 0) {
    // the admin doesn't have any subscriptions
    // create a subscription for them
    // this metadata will become invalid when the subscription is updated,
    // but it is only used after creation

    // can only pass strings
    // so instead create a firestore document or each
    // could create a separate one for each invoice,
    // or pray that the payment is fast enough to just be able to read
    // the business document itself
    // i was planning on just updating the subscription object anyways
    // so it should be fast enough. Okay so i'll go with that. Just read from the business document

    // okay but so how to handle specifying the perkGroup that has been changed?
    // in the metadata of the invoice!
    await stripe.subscriptions.create({
      customer: business.stripeId,
      items: newSubscriptionItemsList,
      metadata: { businessID },
    });
  } else {
    // the admin is already subscribed
    // update the subscription to reflect the new item quantities
    // add item ids to existing subscriptions prices
    for (let i = 0; i < newSubscriptionItemsList.length; i++) {
      newSubscriptionItemsList[i]['id'] = subscriptionItem[0]
        .data()
        .items.filter(
          (item) => item.price.id == newSubscriptionItemsList[i].price
        )?.[0]?.id;
    }

    await stripe.subscriptions.update(subscriptionItem[0].id, {
      items: newSubscriptionItemsList,
    });

    // create an invoice to charge the difference of the subscription
    const createdInvoice = await stripe.invoices.create({
      customer: business.stripeId,
      // auto_advance: true,
      collection_method: 'charge_automatically',
      subscription: subscriptionItem[0].id,
      metadata: { businessID },
    });

    // finalize the invoice
    await stripe.invoices.finalizeInvoice(createdInvoice.id, {
      // auto_advance: true,
    });

    // pay the invoice
    await stripe.invoices.pay(createdInvoice.id, {
      // auto_advance: true,
    });
  }
};
