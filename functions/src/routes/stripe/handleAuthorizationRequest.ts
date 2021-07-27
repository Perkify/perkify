import { allPerks } from '../../../shared';
import { db, stripe } from '../../models';

export const handleAuthorizationRequest = async (auth) => {
  // Authorize the transaction.
  const email = auth.card.cardholder.email;
  const userDoc = await db.collection('users').doc(email).get();
  const userPerks = userDoc.data().perks;
  console.log(userPerks);

  if (
    allPerks.some(
      (perk) =>
        auth.merchant_data.name === perk.PaymentName &&
        auth.merchant_data.network_id === perk.NetworkId
    )
  ) {
    await stripe.issuing.authorizations.approve(auth['id']);
    const businessDoc = await db
      .collection('businesses')
      .doc(userDoc.data().businessID)
      .get();
    const adminID = businessDoc.data().admins[0];
    console.log(adminID);
    // const perkSubscriptions = db
    //   .collection('customers')
    //   .doc(adminID)
    //   .collection('subscriptions')
    //   .where();
    await stripe.subscriptionItems.createUsageRecord(
      '{{SUBSCRIPTION_ITEM_ID}}',
      {
        quantity: 1,
        timestamp: Math.floor(new Date().getTime() / 1000),
        action: 'increment',
      }
    );
  } else await stripe.issuing.authorizations.decline(auth['id']);
};
