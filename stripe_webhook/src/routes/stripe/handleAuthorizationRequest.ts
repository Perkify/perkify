import { allPerks } from "../../constants";
import admin, { db, stripe } from "../../models";

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

  // const businessData = (
  //   await db.collection("businesses").doc(userData.businessID).get()
  // ).data();
  //
  // if (!businessData) {
  //   const error = {
  //     status: 500,
  //     reason: "Missing documents",
  //     reasonDetail: `Documents missing from firestore: ${userData.businessID}`,
  //   };
  //   throw error;
  // }
  //
  // const adminID = businessData.admins[0];
  //
  // const productRef = db.collection("products").doc(perkInfo.Product);
  // // get the subscription associated with the perk that was purchased from customer associated with admin
  // const perkSubscriptions = await db
  //   .collection("customers")
  //   .doc(adminID)
  //   .collection("subscriptions")
  //   .where("product", "==", productRef)
  //   .where("status", "==", "active")
  //   .limit(1)
  //   .get();
  //
  // const perkSubscriptionId = perkSubscriptions.docs[0].data().items[0].id;
  // // add one use of the perk to perks subscription
  // await stripe.subscriptionItems.createUsageRecord(perkSubscriptionId, {
  //   quantity: 1,
  //   timestamp: timestamp.seconds,
  //   action: "increment",
  // });
};

export const handleAuthorizationRequest = async (auth, response) => {
  // Authorize the transaction.

  // auth = {
  //   id: "iauth_1JQ0N7KuQQHSHZsmK0RCXK8w",
  //   object: "issuing.authorization",
  //   amount: 0,
  //   amount_details: {
  //     atm_fee: null,
  //   },
  //   approved: false,
  //   authorization_method: "online",
  //   balance_transactions: [],
  //   card: {
  //     id: "ic_1JKAXJKuQQHSHZsm4yMAHqoi",
  //     object: "issuing.card",
  //     brand: "Visa",
  //     cancellation_reason: null,
  //     cardholder: {
  //       id: "ich_1JKAXJKuQQHSHZsmhX5CF0Ca",
  //       object: "issuing.cardholder",
  //       billing: {
  //         address: {
  //           city: "Warren",
  //           country: "US",
  //           line1: "38 Angus Lane",
  //           line2: null,
  //           postal_code: "07059",
  //           state: "NJ",
  //         },
  //       },
  //       company: null,
  //       created: 1627946829,
  //       email: "prateek.humane@gmail.com",
  //       individual: null,
  //       livemode: true,
  //       metadata: {},
  //       name: "Prateek Humane",
  //       phone_number: null,
  //       requirements: {
  //         disabled_reason: null,
  //         past_due: [],
  //       },
  //       spending_controls: {
  //         allowed_categories: [],
  //         blocked_categories: [],
  //         spending_limits: [],
  //         spending_limits_currency: null,
  //       },
  //       status: "active",
  //       type: "individual",
  //     },
  //     created: 1627946829,
  //     currency: "usd",
  //     exp_month: 7,
  //     exp_year: 2024,
  //     last4: "9083",
  //     livemode: true,
  //     metadata: {},
  //     replaced_by: null,
  //     replacement_for: null,
  //     replacement_reason: null,
  //     shipping: null,
  //     spending_controls: {
  //       allowed_categories: null,
  //       blocked_categories: null,
  //       spending_limits: [
  //         {
  //           amount: 50000,
  //           categories: [],
  //           interval: "daily",
  //         },
  //       ],
  //       spending_limits_currency: "usd",
  //     },
  //     status: "active",
  //     type: "virtual",
  //   },
  //   cardholder: "ich_1JKAXJKuQQHSHZsmhX5CF0Ca",
  //   created: 1629337725,
  //   currency: "usd",
  //   livemode: true,
  //   merchant_amount: 0,
  //   merchant_currency: "usd",
  //   merchant_data: {
  //     category: "cable_satellite_and_other_pay_television_and_radio",
  //     category_code: "4899",
  //     city: "HULU.COM/BILL",
  //     country: "US",
  //     name: "HLU*Hulu 2047849717922-U",
  //     network_id: "395709102324",
  //     postal_code: "90404",
  //     state: "CA",
  //   },
  //   metadata: {},
  //   pending_request: {
  //     amount: 100,
  //     amount_details: {
  //       atm_fee: null,
  //     },
  //     currency: "usd",
  //     is_amount_controllable: false,
  //     merchant_amount: 100,
  //     merchant_currency: "usd",
  //   },
  //   request_history: [],
  //   status: "pending",
  //   transactions: [],
  //   verification_data: {
  //     address_line1_check: "not_provided",
  //     address_postal_code_check: "match",
  //     cvc_check: "match",
  //     expiry_check: "match",
  //   },
  //   wallet: null,
  // };

  // email of card holder
  const email = auth.card.cardholder.email;
  // functions.logger.log('email', email);
  console.log(email);

  console.log(`DB Call Start: ${Date.now()}`);
  const userRef = db.collection("users").doc(email);
  // functions.logger.log('getting user data');
  const userData = (await userRef.get()).data();
  console.log(`DB Call End: ${Date.now()}`);
  console.log(userData);

  if (!userData) {
    const error = {
      status: 500,
      reason: "Missing documents",
      reasonDetail: `Documents missing from firestore: ${email}`,
    };
    throw error;
  }
  // get perks usage associated with the user who made purchase
  const userPerks = userData.perks;
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
  if (perkInfo && perkInfo.AuthorizationHoldFields) {
    isAuthorizationHold = perkInfo.AuthorizationHoldFields.every((field) =>
      // see if the accepted value includes auth value (pointed to by keyPath)
      field.acceptedValues.includes(
        field.keyPath.reduce((acc, cur) => acc[cur], auth)
      )
    );
  }

  let resultingAuth;
  if (isAuthorizationHold) {
    // TODO: RECOMMENT THIS TO AUTHORIZE PERKS
    // await stripe.issuing.authorizations.approve(auth['id']);
    resultingAuth = await stripe.issuing.authorizations.decline(auth["id"]);
    response.status(200).send({ received: true });
  } else if (perkInfo && verifyRequest(perkInfo, userPerks, auth.amount)) {
    console.log("verified");
    // if verified approve it
    // TODO: RECOMMENT THIS TO AUTHORIZE PERKS
    // await stripe.issuing.authorizations.approve(auth['id']);
    resultingAuth = await stripe.issuing.authorizations.decline(auth["id"]);
    // functions.logger.log('declined');

    // TODO: reorganize so this line isn't repeated
    response.status(200).send({ received: true });

    // call handle approve async so function returns within 2 seconds

    await handleApprove(userRef, userData, perkInfo);
  } else {
    resultingAuth = await stripe.issuing.authorizations.decline(auth["id"]);
    response.status(200).send({ received: true });
  }
  await db.collection("transactions").doc(resultingAuth.id).set(resultingAuth);
};
