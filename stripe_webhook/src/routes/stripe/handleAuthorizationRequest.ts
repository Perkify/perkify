import { allPerks } from "../../constants";
import admin, { db, stripe } from "../../models";

const verifyRequest = (perkInfo, userPerks, amount) => {
  // if we offer perk and the user has been granted the perk
  if (perkInfo && perkInfo.Name in userPerks) {
    // get list of last authorized transactions of perk
    const userPerkUses = userPerks[perkInfo.Name];
    const billingCycle = 28 * 24 * 60 * 60; // 28 days in seconds
    const taxPercent = 1.5;

    console.log(`user perks uses: ${userPerkUses}`);
    console.log(`matched perk: ${perkInfo.Name}`);
    console.log(`amount charged: ${amount}`);
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
    [`perkUsesDict.${perkInfo.Name}`]:
      admin.firestore.FieldValue.arrayUnion(timestamp),
  });
};

export const handleAuthorizationRequest = async (auth, response) => {
  // Authorize the transaction.

  // email of card holder
  const email = auth.card.cardholder.email;
  // functions.logger.log('email', email);
  console.log(email);

  console.log(`DB Call Start: ${Date.now()}`);
  const userRef = db.collection("users").doc(email);
  // functions.logger.log('getting user data');
  const userData = (await userRef.get()).data();
  console.log(`DB Call End: ${Date.now()}`);
  // console.log(userData);

  if (!userData) {
    const error = {
      status: 500,
      reason: "Missing documents",
      reasonDetail: `Documents missing from firestore: ${email}`,
    };
    throw error;
  }
  // get perks usage associated with the user who made purchase
  const userPerks = userData.perkUsesDict;
  console.log(`user perks: ${JSON.stringify(userPerks)}`);
  // check if the transaction was using a perk that we offer (and get info on that perk)
  const perkInfo = allPerks.find(
    (perk) =>
      auth.merchant_data.name
        .toLowerCase()
        .includes(perk.PaymentName.toLowerCase())
    // && auth.merchant_data.network_id === perk.NetworkId
  );

  console.log(perkInfo);
  // we still have to check if it's an auth hold otherwise we count non auth holds towards a perk use
  let isAuthorizationHold = false;
  if (
    perkInfo &&
    perkInfo.Name in userPerks &&
    perkInfo.AuthorizationHoldFields
  ) {
    isAuthorizationHold = perkInfo.AuthorizationHoldFields.every((field) =>
      // see if the accepted value includes auth value (pointed to by keyPath)
      field.acceptedValues.includes(
        field.keyPath.reduce((acc, cur) => acc[cur], auth)
      )
    );
  }

  console.log(`is auth hold: ${isAuthorizationHold}`);
  let resultingAuth;
  if (isAuthorizationHold) {
    // TODO: RECOMMENT THIS TO AUTHORIZE PERKS
    resultingAuth = await stripe.issuing.authorizations.approve(auth["id"]);
    // resultingAuth = await stripe.issuing.authorizations.decline(auth["id"]);
    response.status(200).send({ received: true });
    console.log("auth hold accepted");
  } else if (
    perkInfo &&
    verifyRequest(perkInfo, userPerks, auth.pending_request.amount)
  ) {
    // if verified approve it
    // TODO: RECOMMENT THIS TO AUTHORIZE PERKS
    resultingAuth = await stripe.issuing.authorizations.approve(auth["id"]);
    // resultingAuth = await stripe.issuing.authorizations.decline(auth["id"]);
    // functions.logger.log('declined');

    // TODO: reorganize so this line isn't repeated
    response.status(200).send({ received: true });

    console.log("verified and accepted");
    // call handle approve async so function returns within 2 seconds

    await handleApprove(userRef, userData, perkInfo);
  } else {
    resultingAuth = await stripe.issuing.authorizations.decline(auth["id"]);
    response.status(200).send({ received: true });
    console.log("declined");
  }
  await db.collection("transactions").doc(resultingAuth.id).set(resultingAuth);
};
