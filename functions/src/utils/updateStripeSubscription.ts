import { NextFunction } from 'express';
import { logger } from 'firebase-functions';
import { allPerksDict, privatePerksDict, taxRates } from '../../shared';
import { db, stripe } from '../services';
import { Subscription } from '../types';
import { shrinkUsers } from './crudHelpers';
import { propogateSubscriptionUpdateToLiveUsers } from './propogateSubscriptionUpdateToLiveUsers';

// we want to call this anytime we modify a stripe subscription
// takes the business definition and updates the relevant stripe subscription

// update stripe subscription with business perkGroups
export const updateStripeSubscription = async (
  preUpdateBusinessData: Business,
  next: NextFunction
) => {
  const businessID = preUpdateBusinessData.businessID;

  const businessData = (
    await db
      .collection('businesses')
      .doc(preUpdateBusinessData.businessID)
      .get()
  ).data() as Business;

  if (businessData == null) {
    const error = {
      status: 500,
      reason: 'Missing business document',
      reasonDetail: `Missing business document in firestore`,
    };
    return next(error);
  }

  // remove stuff that shouldn't exist from 'users'
  await shrinkUsers(businessData);

  const quantityByPriceID = Object.keys(businessData.perkGroups).reduce(
    (accumulator, perkGroupName) => {
      businessData.perkGroups[perkGroupName].perkNames.forEach((perkName) => {
        if (accumulator[allPerksDict[perkName].stripePriceId]) {
          accumulator[allPerksDict[perkName].stripePriceId] +=
            businessData.perkGroups[perkGroupName].userEmails.length;
        } else {
          accumulator[allPerksDict[perkName].stripePriceId] =
            businessData.perkGroups[perkGroupName].userEmails.length;
        }
      });
      return accumulator;
    },
    {} as { [key: string]: number }
  );

  const numEmployees = Object.values(businessData.perkGroups).reduce(
    (acc, perkGroup) => acc + perkGroup.userEmails.length,
    0
  );

  // convert the count of each perk to a list of items
  const newSubscriptionItemsList = (
    Object.keys(quantityByPriceID).map((priceID) => ({
      price: priceID,
      quantity: quantityByPriceID[priceID],
      tax_rates: [taxRates.perkifyTax.stripeTaxID],
    })) as {
      price: string;
      quantity: number;
      id?: string;
      tax_rates?: string[];
      deleted?: boolean;
    }[]
  ).concat([
    // add the perkify cost per employee with no tax rate
    {
      price: privatePerksDict['Perkify Cost Per Employee'].stripePriceID,
      quantity: numEmployees,
      tax_rates: [],
      deleted: numEmployees == 0,
    },
  ]);

  // check if the customer has an existing active subscriptions
  const subscriptionsSnapshot = await db
    .collection('businesses')
    .doc(businessID)
    .collection('subscriptions')
    .get();

  const subscriptionItem = subscriptionsSnapshot.docs.filter(
    (doc) =>
      (doc.data() as Subscription).canceled_at == null &&
      (doc.data() as Subscription).status == 'active'
  )?.[0];

  if (!(subscriptionItem && subscriptionItem.exists)) {
    // the admin doesn't have any subscriptions
    // create a subscription for them
    try {
      // will throw an error if payment fails
      const subscription = await stripe.subscriptions.create({
        customer: businessData.stripeId,
        items: newSubscriptionItemsList,
        payment_behavior: 'error_if_incomplete',
      });

      // payment succeeded
      propogateSubscriptionUpdateToLiveUsers(businessData, subscription);
    } catch (e) {
      logger.error(e);
      // payment failed
      // next time we try again from scratch

      // revert changes to business document
      await db
        .collection('businesses')
        .doc(businessData.businessID)
        .update({
          [`perkGroups`]: preUpdateBusinessData.perkGroups,
        });

      // throw an error for the client
      const error: PerkifyError = {
        status: 500,
        reason: 'Insufficient funds',
        reasonDetail:
          'Payment failed with your default payment method. Please update your default payment method and try again',
      };
      return next(error);
    }
  } else {
    // the admin is already subscribed
    // update the subscription to reflect the new item quantities
    // add item ids to existing subscriptions prices

    // const subscriptionID = subscriptionItem.id;
    const subscriptionObject = subscriptionItem.data() as Subscription;
    const currentBillingPeriodStart =
      subscriptionObject.current_period_start.seconds;

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

    // remove items from the subscription with quantity 0
    const oldPriceIDs = Object.keys(oldQuantityByPriceID);
    for (let i = 0; i < oldPriceIDs.length; i++) {
      const priceID = oldPriceIDs[i];
      // check if the priceID exists in the newSubscriptionItemsList
      const item = newSubscriptionItemsList.find(
        (item) => item.price == priceID
      );
      // if price doesn't exist in the newSubscriptionItemsList
      // it means we are removing it from the subscription
      // so set it's quantity to 0 and mark it to be deleted
      if (!item) {
        newSubscriptionItemsList.push({
          price: priceID,
          quantity: 0,
          tax_rates: [taxRates.perkifyTax.stripeTaxID],
          deleted: true,
        });
      }
    }

    // set the relevant ids on the items for the stripe api
    for (let i = 0; i < newSubscriptionItemsList.length; i++) {
      newSubscriptionItemsList[i]['id'] = subscriptionObject.items.filter(
        (item: { price: { id: string } }) =>
          item.price.id == newSubscriptionItemsList[i].price
      )?.[0]?.id;
    }

    // get the set of priceIDs minus the perkify cost per employee
    // use a set to remove duplicate priceIDs
    const priceIDs = Array.from(
      new Set(
        Object.keys(quantityByPriceID).concat(Object.keys(oldQuantityByPriceID))
      )
    ).filter(
      (stripePriceID) =>
        stripePriceID !=
        privatePerksDict['Perkify Cost Per Employee'].stripePriceID
    );

    // should be true if for every price id, the new subscription quantity is greater than
    // or equal to the old subscription quantity
    const isSubscriptionIncrease = priceIDs.every(
      (priceID) =>
        (priceID in quantityByPriceID ? quantityByPriceID[priceID] : 0) >=
        (priceID in oldQuantityByPriceID ? oldQuantityByPriceID[priceID] : 0)
    );

    // should be true if for every price id, the new subscription quantity is less than
    // or equal to the old subscription quantity
    const isSubscriptionDecrease = priceIDs.every((priceID) => {
      return (
        (priceID in quantityByPriceID ? quantityByPriceID[priceID] : 0) <=
        (priceID in oldQuantityByPriceID ? oldQuantityByPriceID[priceID] : 0)
      );
    });

    if (isSubscriptionIncrease && !isSubscriptionDecrease) {
      // update the subscription and charge the customer
      logger.info(
        `Increasing stripe subscription ${subscriptionItem.id} for ${businessID}`,
        {
          items: newSubscriptionItemsList,
          proration_behavior: 'always_invoice',
          proration_date: currentBillingPeriodStart,
          payment_behavior: 'error_if_incomplete',
        }
      );

      try {
        // will throw an error if payment fails
        const subscription = await stripe.subscriptions.update(
          subscriptionItem.id,
          {
            items: newSubscriptionItemsList,
            proration_behavior: 'always_invoice',
            proration_date: currentBillingPeriodStart,
            payment_behavior: 'error_if_incomplete',
          }
        );

        // payment succeeded
        propogateSubscriptionUpdateToLiveUsers(businessData, subscription);
      } catch (e) {
        // payment fails

        // revert changes to business document
        await db
          .collection('businesses')
          .doc(businessData.businessID)
          .update({
            [`perkGroups`]: preUpdateBusinessData.perkGroups,
          });

        // throw an error for the client
        const error: PerkifyError = {
          status: 500,
          reason: 'Insufficient funds',
          reasonDetail:
            'Payment failed with your default payment method. Please update your default payment method and try again',
        };
        return next(error);
      }
    } else if (isSubscriptionDecrease && !isSubscriptionIncrease) {
      // update the subscription, don't give anything back

      logger.info(
        `Decreasing stripe subscription ${subscriptionItem.id} for ${businessID}`,
        {
          items: newSubscriptionItemsList,
          proration_behavior: 'none',
        }
      );

      // check if we should cancel the subscription
      if (Object.keys(businessData.perkGroups).length == 0) {
        // cancel the subscription because the business has no perk groups / perks

        // should succeed every time
        await stripe.subscriptions.del(subscriptionItem.id, {
          prorate: false,
        });
      } else {
        // otherwise we just update the subscription, don't cancel it

        // should succeed every time
        await stripe.subscriptions.update(subscriptionItem.id, {
          items: newSubscriptionItemsList,
          proration_behavior: 'none',
        });
      }
    } else {
      logger.error(
        'Should not have simultaneous subscription increase and decrease',
        businessData,
        quantityByPriceID
      );
    }
  }
};
