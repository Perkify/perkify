import { allPerks } from '../../shared';
import admin, { db, stripe } from '../models';

export const createUserHelper = async (email, businessID, group, perks) => {
  const docRef = db.collection('users').doc(email);

  await docRef.set({
    businessID,
    group,
    perks: [],
  });

  const signInLink = await admin.auth().generateSignInWithEmailLink(email, {
    url: 'http://localhost:3000/dashboard', // I don't think you're supposed to do it this way. Maybe less secure
  });

  // send email
  await db.collection('mail').add({
    to: email,
    message: {
      subject: 'Your employer has signed you up for Perkify!',
      text: `
        Your employer purchased these Perks for you:\n
        ${perks} 
        
        Use this link to sign into your account and redeem your Perks: ${signInLink}.\n 
        `,
    },
  });
};

export const deleteUserHelper = async (userDoc) => {
  await db.collection('users').doc(userDoc.id).delete();
};

export const syncStripeSubscriptionsWithFirestorePerks = async (
  userUid,
  businessID
) => {
  const businessData = (
    await db.collection('businesses').doc(businessID).get()
  ).data();

  if (!businessData) {
    const error = {
      status: 500,
      reason: 'Missing document',
      reason_detail: 'Could not find business data document',
    };
    throw error;
  }

  // get list of perks that business has
  const perkSet = new Set();
  for (const perkGroupName in businessData.groups) {
    businessData.groups[perkGroupName].forEach((perkName) =>
      perkSet.add(perkName)
    );
  }

  // compare the list of perks to the list of subscriptions, and cancel any subscriptions for which no perks are being offered
  const subscriptionsSnapshot = await db
    .collection('customers')
    .doc(userUid)
    .collection('subscriptions')
    .get();

  const subscriptionItems = subscriptionsSnapshot.docs.map((doc) => ({
    subscription_id: doc.data().subscription,
    name: doc.data().items[0].price.name,
  }));

  // get the subscriptions that exist but do not exist in the active perks
  // TODO: handle case where subscription is canceled
  const subscriptionsToCancel = subscriptionItems.filter((subObj) =>
    perkSet.has(subObj.name)
  );

  // get the perks that exist but for which there aren't any subscriptions
  const perkNamesToCreate = Array.from(perkSet).filter(
    (perkName) =>
      !subscriptionItems.map((subObj) => subObj.name).includes(perkName)
  );
  const perkObjectsToCreate = allPerks.filter((perk) =>
    perkNamesToCreate.includes(perk.Name)
  );

  await Promise.all(
    subscriptionsToCancel.map(async (subObj) => {
      await stripe.subscriptions.del(subObj.subscription_id);
    })
  );

  const customerData = (
    await db.collection('customers').doc(userUid).get()
  ).data();

  if (customerData == null) {
    const error = {
      status: 500,
      reason: 'Missing documents',
      reason_detail: `Documents missing from firestore`,
    };
    throw error;
  }

  await Promise.all(
    perkObjectsToCreate.map(async (perkObj) => {
      await stripe.subscriptions.create({
        customer: customerData.stripeCustomerId,
        items: [{ price: perkObj.stripePriceId }],
      });
    })
  );
};
