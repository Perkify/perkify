import admin, { db, stripe } from "../../services";
import { allProductionPerks } from "../../shared/constants";

const verifyRequest = async (perkInfo, employeeData, amount) => {
  // if we offer perk and the user has been granted the perk
  if (perkInfo && perkInfo.Name in employeeData.perkUsesDict) {
    // get list of last authorized transactions of perk
    const employeePerkUses = employeeData.perkUsesDict[perkInfo.Name];
    // const billingCycle = 28 * 24 * 60 * 60; // 28 days in seconds
    const taxPercent = 1.5;

    const subscriptionsSnapshot = await db
      .collection("businesses")
      .doc(employeeData.businessID)
      .collection("subscriptions")
      .get();

    const staticSubscriptionItem = subscriptionsSnapshot.docs.filter(
      (doc) =>
        (doc.data() as Subscription).canceled_at == null &&
        (doc.data() as Subscription).status == "active"
    )?.[0];

    const lastBillingDate = staticSubscriptionItem.data().current_period_start
      .seconds;

    console.log(`user perks uses: ${employeePerkUses}`);
    console.log(`matched perk: ${perkInfo.Name}`);
    console.log(`amount charged: ${amount}`);
    console.log(`last billing date: ${lastBillingDate}`);
    // if perk hasn't been used or hasn't been used in last 28 days and is less than the price
    return (
      (employeePerkUses.length === 0 ||
        employeePerkUses[employeePerkUses.length - 1].seconds <
          lastBillingDate) &&
      amount < perkInfo.Cost * taxPercent
    );
  } else return false;
};

const handleApprove = async (employeeData, perkInfo) => {
  const timestamp = admin.firestore.Timestamp.now();
  // note the timestamp it was used so it can't be for the next 28 days

  // alternatively use employeeSnap.foreach()
  await db
    .collection("businesses")
    .doc(employeeData.businessID)
    .collection("employees")
    .doc(employeeData.employeeID)
    .update({
      [`perkUsesDict.${perkInfo.Name}`]: admin.firestore.FieldValue.arrayUnion(
        timestamp
      ),
    });
};

export const handleAuthorizationRequest = async (auth, response) => {
  // Authorize the transaction.

  // email of card holder
  const email = auth.card.cardholder.email;
  // functions.logger.log('email', email);
  console.log(email);

  console.log(`DB Call Start: ${Date.now()}`);
  const employeeSnap = await db
    .collectionGroup("employees")
    .where("email", "==", email)
    .get();
  // functions.logger.log('getting user data');
  // console.log(userData);

  if (employeeSnap.size !== 1) {
    const error =
      employeeSnap.size < 1
        ? {
            status: 500,
            reason: "employee account does not exist",
            reasonDetail: "employee account does not exist",
          }
        : {
            status: 500,
            reason: "multiple employee accounts exist",
            reasonDetail: "multiple employee accounts exist",
          };
    throw error;
  }

  const employeeData = employeeSnap.docs[0].data() as Employee;

  console.log(`DB Call End: ${Date.now()}`);

  if (!employeeData) {
    const error = {
      status: 500,
      reason: "Missing documents",
      reasonDetail: `Documents missing from firestore: ${email}`,
    };
    throw error;
  }
  // get perks usage associated with the user who made purchase
  const employeePerks = employeeData.perkUsesDict;
  console.log(`employee perks: ${JSON.stringify(employeePerks)}`);
  // check if the transaction was using a perk that we offer (and get info on that perk)
  const perkInfo = allProductionPerks.find(
    (perk) =>
      auth.merchant_data.name
        .toLowerCase()
        .includes(perk.PaymentName.toLowerCase())
    // && auth.merchant_data.network_id === perk.NetworkId
  );

  console.log(perkInfo);
  // we still have to check if it's an auth hold otherwise we count non auth holds towards a perk use
  let isAuthorizationHold = false;
  if (perkInfo && perkInfo.Name in employeePerks && perkInfo.AuthHoldFields) {
    isAuthorizationHold = perkInfo.AuthHoldFields.every((field) =>
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
    verifyRequest(perkInfo, employeeData, auth.pending_request.amount)
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

    await handleApprove(employeeData, perkInfo);
  } else {
    resultingAuth = await stripe.issuing.authorizations.decline(auth["id"]);
    response.status(200).send({ received: true });
    console.log("declined");
  }
  await db.collection("transactions").doc(resultingAuth.id).set(resultingAuth);
};
