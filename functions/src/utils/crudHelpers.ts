import { allPerksDict, newUserTemplateGenerator } from '../../shared';
import admin, { db, functions, stripe } from '../models';

export const createUserHelper = async (email, businessID, group, perks) => {
  const docRef = db.collection('users').doc(email);

  await docRef.set({
    businessID,
    group,
    perks: perks.reduce((map, perk) => ((map[perk] = []), map), {}),
  });

  const signInLink = await admin.auth().generateSignInWithEmailLink(email, {
    url:
      functions.config()['stripe-firebase'].environment == 'production'
        ? 'https://app.getperkify.com/dashboard'
        : functions.config()['stripe-firebase'].environment == 'staging'
        ? 'https://app.dev.getperkify.com/dashboard'
        : 'http://localhost:3001/dashboard', // I don't think you're supposed to do it this way. Maybe less secure
  });

  // send email
  await db.collection('mail').add({
    to: email,
    message: {
      subject: 'Your employer has signed you up for Perkify!',
      html: newUserTemplateGenerator({ signInLink }),
    },
  });
};

export const deleteUserHelper = async (userDoc) => {
  if (userDoc.data().card)
    await stripe.issuing.cards.update(userDoc.data().card.id, {
      status: 'canceled',
    });
  await db.collection('users').doc(userDoc.id).delete();
};

export const syncStripeSubscriptionsWithFirestorePerks = async (
  userUid,
  businessID
) => {
  // get business data
  const businessData = (
    await db.collection('businesses').doc(businessID).get()
  ).data();

  if (!businessData) {
    const error = {
      status: 500,
      reason: 'Missing document',
      reasonDetail: 'Could not find business data document',
    };
    throw error;
  }

  // get customer data
  const customerData = (
    await db.collection('customers').doc(userUid).get()
  ).data();

  if (customerData == null) {
    const error = {
      status: 500,
      reason: 'Missing documents',
      reasonDetail: `Documents missing from firestore`,
    };
    throw error;
  }

  // get the business employees
  const businessEmployees = await db
    .collection('users')
    .where('businessID', '==', businessID)
    .get();

  // count how many of each perk the business has registered employees for
  const perkCountsByName = businessEmployees.docs.reduce(
    (accumulator, employeeDoc) => {
      const employee = employeeDoc.data();

      employee.perks.forEach((perk) => {
        if (accumulator[perk]) {
          accumulator[perk] += 1;
        } else {
          accumulator[perk] = 1;
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
    .collection('customers')
    .doc(userUid)
    .collection('subscriptions')
    .get();

  const subscriptionItem = subscriptionsSnapshot.docs
    .filter((doc) => doc.data().canceled_at == null)
    .map((doc) => doc.id);

  if (subscriptionItem.length == 0) {
    // the admin doesn't have any subscriptions
    // create a subscription for them

    const subscription = await stripe.subscriptions.create({
      customer: customerData.stripeId,
      items: newSubscriptionItemsList,
    });
  } else {
    // the admin is already subscribed
    // update the subscription to reflect the new item quantities
    const subscription = await stripe.subscriptions.update(
      subscriptionItem[0],
      { items: newSubscriptionItemsList }
    );
  }
};
