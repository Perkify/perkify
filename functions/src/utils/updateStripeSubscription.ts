import { allPerksDict } from '../../shared';
import { db, stripe } from '../services';
import { shrinkUsers } from './crudHelpers';

// we want to call this anytime we modify a stripe subscription
// takes the business definition and updates the relevant stripe subscription

// update stripe subscription with business perk groups
export const updateStripeSubscription = async (updatedBusiness: Business) => {
  // get business data
  const businessID = updatedBusiness.businessID;

  // remove stuff that shouldn't exist from 'users'
  await shrinkUsers(updatedBusiness);

  const perkCountsByName = Object.keys(updatedBusiness.perkGroups).reduce(
    (accumulator, perkGroupName) => {
      updatedBusiness.perkGroups[perkGroupName].perkNames.forEach(
        (perkName) => {
          if (accumulator[perkName]) {
            accumulator[perkName] +=
              updatedBusiness.perkGroups[perkGroupName].emails.length;
          } else {
            accumulator[perkName] =
              updatedBusiness.perkGroups[perkGroupName].emails.length;
          }
        }
      );
      return accumulator;
    },
    {} as { [key: string]: number }
  );

  // convert the count of each perk to a list of items
  const newSubscriptionItemsList = Object.keys(perkCountsByName).map(
    (perkName) => ({
      price: allPerksDict[perkName].stripePriceId,
      quantity: perkCountsByName[perkName],
    })
  ) as {
    price: string;
    quantity: number;
    id?: string;
  }[];

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
          (item: { price: { id: string } }) =>
            item.price.id == newSubscriptionItemsList[i].price
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
