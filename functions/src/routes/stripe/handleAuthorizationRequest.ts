import axios from 'axios';
import { allPerks } from '../../../shared';
import admin, { db, functions, stripe } from '../../models';

const verifyRequest = (perkInfo, userPerks, amount) => {
  // if we offer perk and the user has been granted the perk
  if (perkInfo && perkInfo.Name in userPerks) {
    // get list of last authorized transactions of perk
    const userPerkUses = userPerks[perkInfo.Name];
    const billingCycle = 28 * 24 * 60 * 60; // 28 days in seconds
    const taxPercent = 1.5;
    // if perk hasn't been used or hasn't been used in last 28 days and is less than the price
    return (
      (userPerkUses.length === 0 ||
        userPerkUses[userPerkUses.length - 1].seconds + billingCycle <
          admin.firestore.Timestamp.now().seconds) &&
      amount < perkInfo.Cost * taxPercent
    );
  } else return false;
};

const handleApprove = async (userRef, userData, perkInfo) => {
  const timestamp = admin.firestore.Timestamp.now();
  // note the timestamp it was used so it can't be for the next 28 days
  await userRef.update({
    [`perks.${perkInfo.Name}`]:
      admin.firestore.FieldValue.arrayUnion(timestamp),
  });

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

  const adminID = businessData.admins[0];

  const productRef = db.collection('products').doc(perkInfo.Product);
  // get the subscription associated with the perk that was purchased from customer associated with admin
  const perkSubscriptions = await db
    .collection('customers')
    .doc(adminID)
    .collection('subscriptions')
    .where('product', '==', productRef)
    .where('status', '==', 'active')
    .limit(1)
    .get();

  const perkSubscriptionId = perkSubscriptions.docs[0].data().items[0].id;
  // add one use of the perk to perks subscription
  await stripe.subscriptionItems.createUsageRecord(perkSubscriptionId, {
    quantity: 1,
    timestamp: timestamp.seconds,
    action: 'increment',
  });
};

export const handleAuthorizationRequest = async (auth, response) => {
  // Authorize the transaction.
  // functions.logger.log('authorization data:', JSON.stringify(auth));
  // functions.logger.log('merchant data:', JSON.stringify(auth.merchant_data));

  // email of card holder
  const email = auth.card.cardholder.email;
  // functions.logger.log('email', email);

  // const userRef = db.collection('users').doc(email);
  // functions.logger.log('getting user data');
  // const userData = (await userRef.get()).data();

  // functions.logger.log('getting user auth');
  // const userAuth = await admin.auth().getUserByEmail(email);
  // functions.logger.log('getting user token', userAuth.uid);
  // const userToken = await admin.auth().createCustomToken(userAuth.uid);
  const userToken =
    'ya29.a0ARrdaM-UGKD4TmPEPVNrj3EHRAWw6HS_jn8eIrsBWcctJV8eJOOI3fMduZvHZZYjZ_dLUHRFigKzuzBZjm81yC6k8aux_9tSF0BXd3onzLfVyqPnRvkA22GJ68Llp_tdt63v6HosxfDDR2zKFmZMu-fvPENx';
  // functions.logger.log('user token:', userToken);
  const secretKey = 'AIzaSyA8MFTaagEWsF3-9tUL1GvZq3OGeA4XL5k';

  functions.logger.log('getting user data');
  const userDataResponse = await axios.get(
    `https://firestore.googleapis.com/v1/projects/perkify-prod/databases/(default)/documents/users/${email}?key=${secretKey}`,
    {
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
  const userData = userDataResponse.data.fields;
  functions.logger.log('user data:', userData);

  if (!userData) {
    const error = {
      status: 500,
      reason: 'Missing documents',
      reasonDetail: `Documents missing from firestore: ${email}`,
    };
    throw error;
  }
  // get perks usage associated with the user who made purchase
  const userPerks = userData.perks;
  // check if the transaction was using a perk that we offer (and get info on that perk)
  functions.logger.log('perk info find');
  const perkInfo = allPerks.find(
    (perk) =>
      auth.merchant_data.name
        .toLowerCase()
        .includes(perk.PaymentName.toLowerCase())
    // && auth.merchant_data.network_id === perk.NetworkId
  );

  // we still have to check if it's an auth hold otherwise we count non auth holds towards a perk use
  functions.logger.log('check auth hold');
  let isAuthorizationHold = false;
  if (perkInfo && perkInfo.AuthorizationHoldFields) {
    isAuthorizationHold = perkInfo.AuthorizationHoldFields.every((field) =>
      // see if the accepted value includes auth value (pointed to by keyPath)
      field.acceptedValues.includes(
        field.keyPath.reduce((acc, cur) => acc[cur], auth)
      )
    );
  }
  // functions.logger.log('user perks:', JSON.stringify(userPerks));
  // functions.logger.log('perk info:', JSON.stringify(perkInfo));
  functions.logger.log('authorization hold?:', isAuthorizationHold);

  let resultingAuth;
  if (isAuthorizationHold) {
    // TODO: RECOMMENT THIS TO AUTHORIZE PERKS
    // await stripe.issuing.authorizations.approve(auth['id']);
    resultingAuth = await stripe.issuing.authorizations.decline(auth['id']);
    functions.logger.log('declined');
    response.status(200).send({ received: true });
  } else if (perkInfo && verifyRequest(perkInfo, userPerks, auth.amount)) {
    console.log('verified');
    // if verified approve it
    // TODO: RECOMMENT THIS TO AUTHORIZE PERKS
    // await stripe.issuing.authorizations.approve(auth['id']);
    functions.logger.log('verified and declining');
    resultingAuth = await stripe.issuing.authorizations.decline(auth['id']);
    // functions.logger.log('declined');

    // TODO: reorganize so this line isn't repeated
    response.status(200).send({ received: true });

    // call handle approve async so function returns within 2 seconds

    const userRef = db.collection('users').doc(email);
    await handleApprove(userRef, userData, perkInfo);
  } else {
    resultingAuth = await stripe.issuing.authorizations.decline(auth['id']);
    response.status(200).send({ received: true });
    functions.logger.log('declined');
  }
  await db.collection('transactions').doc(resultingAuth.id).set(resultingAuth);
  functions.logger.log('finished');
};
