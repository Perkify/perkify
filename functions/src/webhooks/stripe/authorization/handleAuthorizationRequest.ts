import Stripe from 'stripe';
import { allPerks } from '../../../../shared';
import admin, { db, stripe } from '../../../services';

const verifyRequest = (
  perkInfo: PerkDefinition,
  perkUsesDict: PerkUsesDict,
  amount: number
) => {
  // if we offer perk and the user has been granted the perk
  if (perkInfo && perkInfo.Name in perkUsesDict) {
    // get list of last authorized transactions of perk
    const userPerkUses = perkUsesDict[perkInfo.Name];
    const billingCycle = 28 * 24 * 60 * 60; // 28 days in seconds
    const taxPercent = 1.1;
    // if perk hasn't been used or hasn't been used in last 28 days and is less than the price

    return (
      (userPerkUses.length === 0 ||
        userPerkUses[userPerkUses.length - 1].seconds + billingCycle <
          admin.firestore.Timestamp.now().seconds) &&
      amount < perkInfo.Cost * taxPercent
    );
  } else return false;
};

export const handleAuthorizationRequest = async (
  auth: Stripe.Issuing.Authorization
) => {
  // Authorize the transaction.
  // auth = {
  //   amount: 6.99,
  //   card: {
  //     cardholder: {
  //       email: 'prateek@humane.com',
  //     },
  //   },
  //   merchant_data: {
  //     name: 'Netflix',
  //     network_id: '12345',
  //   },
  // };

  // email of card holder
  const email = auth.card.cardholder.email;
  const userRef = db.collection('users').doc(email as string);
  const userData = (await userRef.get()).data() as User;
  if (!userData) {
    const error = {
      status: 500,
      reason: 'Missing documents',
      reasonDetail: `Documents missing from firestore: ${email}`,
    };
    throw error;
  }
  // get perk usage associated with the user who made purchase
  const perkUsesDict = userData.perkUsesDict;
  // check if the transaction was using a perk that we offer (and get info on that perk)
  const perkInfo = allPerks.find(
    (perk) =>
      auth.merchant_data.name === perk.PaymentName &&
      auth.merchant_data.network_id === perk.NetworkId
  );

  if (perkInfo && verifyRequest(perkInfo, perkUsesDict, auth.amount)) {
    // if verified approve it
    // TODO: RECOMMENT THIS TO AUTHORIZE PERK
    // await stripe.issuing.authorizations.approve(auth['id']);

    const timestamp = admin.firestore.Timestamp.now();
    // note the timestamp it was used so it can't be for the next 28 days
    await userRef.update({
      [`perkUsesDict.${perkInfo.Name}`]:
        admin.firestore.FieldValue.arrayUnion(timestamp),
    } as Partial<User>);

    const businessData = (
      await db.collection('businesses').doc(userData.businessID).get()
    ).data();

    if (!businessData) {
      const error = {
        status: 500,
        reason: 'Missing documents',
        reasonDetail: `Documents missing from firestore: ${userData.businessID}`,
      };
      throw error;
    }

    const productRef = db.collection('products').doc(perkInfo.Product);
    // get the subscription associated with the perk that was purchased from customer associated with admin
    const perkSubscriptions = await db
      .collection('businesses')
      .doc(userData.businessID)
      .collection('subscriptions')
      .where('product', '==', productRef)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    const perkSubscriptionId = perkSubscriptions.docs[0].data().items[0].id;
    // add one use of the perk to subscription
    await stripe.subscriptionItems.createUsageRecord(perkSubscriptionId, {
      quantity: 1,
      timestamp: timestamp.seconds,
      action: 'increment',
    });
  } else await stripe.issuing.authorizations.decline(auth['id']);
};
