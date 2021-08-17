import { allPerksDict } from '../../shared';
import { db, stripe } from '../models';
import { shrinkUsers } from './shrinkUsers';

// takes an admin id and business id
// updates the stripe subscription to match the perks and employees in the business document
// to be used after making an update to a single perk group
// must be called separately for each updated perk group

// we want to call this anytime we modify a stripe subscription

// update stripe subscription with business perks
export const updateStripeSubscription = async (updatedBusiness: Business) => {
  // get business data
  const businessID = updatedBusiness.businessID;

  if (!updatedBusiness) {
    const error = {
      status: 500,
      reason: 'Missing document',
      reasonDetail: 'Could not find business data document',
    };
    throw error;
  }

  // remove stuff that shouldn't exist from 'users'
  await shrinkUsers(updatedBusiness);

  const perkCountsByName = Object.keys(updatedBusiness.perkGroups).reduce(
    (accumulator, perkGroupName) => {
      updatedBusiness.perkGroups[perkGroupName].perks.forEach((perkName) => {
        if (accumulator[perkName]) {
          accumulator[perkName] +=
            updatedBusiness.perkGroups[perkGroupName].emails.length;
        } else {
          accumulator[perkName] =
            updatedBusiness.perkGroups[perkGroupName].emails.length;
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
    await stripe.subscriptions.create({
      customer: updatedBusiness.stripeId,
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
      customer: updatedBusiness.stripeId,
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
