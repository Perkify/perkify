import { allPerks } from '../../../shared';
import admin, { db, stripe } from '../../models';

const verifyRequest = (perkInfo, userPerks) => {
  // if we offer perk and the user has been granted the perk
  if (perkInfo && perkInfo.Name in userPerks) {
    // get list of last authorized transactions of perk
    const userPerkUses = userPerks[perkInfo.Name];
    const billingCycle = 28 * 24 * 60 * 60; // 28 days in seconds
    // if perk hasn't been used or hasn't been used in last 28 days
    return (
      userPerkUses === [] ||
      userPerkUses[userPerkUses.length - 1].seconds + billingCycle <
        admin.firestore.Timestamp.now().seconds
    );
  } else return false;
};

export const handleAuthorizationRequest = async (auth) => {
  // Authorize the transaction.

  // email of card holder
  const email = auth.card.cardholder.email;
  const userRef = db.collection('users').doc(email);
  const userDoc = await userRef.get();
  // get perks map associated with the user who made purchase
  const userPerks = userDoc.data().perks;
  console.log(userPerks);
  // check if the transaction was using a perk that we offer (and get info on that perk)
  const perkInfo = allPerks.find(
    (perk) =>
      auth.merchant_data.name === perk.PaymentName &&
      auth.merchant_data.network_id === perk.NetworkId
  );

  if (verifyRequest(perkInfo, userPerks)) {
    // if verified approve it
    await stripe.issuing.authorizations.approve(auth['id']);

    const timestamp = admin.firestore.Timestamp.now();
    // note the timestamp it was used so it can't be for the next 28 days
    await userRef.update({
      perks: admin.firestore.FieldValue.arrayUnion(timestamp),
    });

    const businessDoc = await db
      .collection('businesses')
      .doc(userDoc.data().businessID)
      .get();
    const adminID = businessDoc.data().admins[0];
    console.log(adminID);
    // get the subscription associated with the perk that was purchased from customer associated with admin
    const perkSubscriptions = await db
      .collection('customers')
      .doc(adminID)
      .collection('subscriptions')
      .where('product', '==', `/products/${perkInfo.Product}`)
      .limit(1)
      .get();
    const perkSubscriptionId = perkSubscriptions.docs[0].data().items[0].id;
    // add one use of the perk to perks subscription
    await stripe.subscriptionItems.createUsageRecord(perkSubscriptionId, {
      quantity: 1,
      timestamp: timestamp.seconds,
      action: 'increment',
    });
  } else await stripe.issuing.authorizations.decline(auth['id']);
};
