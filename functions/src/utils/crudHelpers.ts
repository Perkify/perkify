import { allPerks, newUserTemplateGenerator } from '../../shared';
import admin, { db, stripe } from '../models';

export const createUserHelper = async (email, businessID, group, perks) => {
  const docRef = db.collection('users').doc(email);

  await docRef.set({
    businessID,
    group,
    perks: perks.reduce((map, perk) => ((map[perk] = []), map), {}),
  });

  const signInLink = await admin.auth().generateSignInWithEmailLink(email, {
    url:
      process.env.NODE_ENV == 'development'
        ? 'http://localhost:3001/dashboard'
        : 'https://app.getperkify.com/', // I don't think you're supposed to do it this way. Maybe less secure
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

  // get list of perks that business has
  const perkSet = new Set();
  Object.keys(businessData.groups).forEach((perkGroupName) => {
    businessData.groups[perkGroupName].forEach((perkName) =>
      perkSet.add(perkName)
    );
  });

  // compare the list of perks to the list of subscriptions, and cancel any subscriptions for which no perks are being offered
  const subscriptionsSnapshot = await db
    .collection('customers')
    .doc(userUid)
    .collection('subscriptions')
    .get();

  const subscriptionItems = subscriptionsSnapshot.docs
    .filter((doc) => doc.data().canceled_at == null)
    .map((doc) => {
      return {
        subscription_id: doc.data().items[0].subscription,
        name: doc.data().items[0].price.product.name,
      };
    });

  // get the subscriptions that exist but do not exist in the active perks
  // TODO: handle case where subscription is canceled
  const subscriptionsToCancel = subscriptionItems.filter(
    (subObj) => !perkSet.has(subObj.name)
  );

  // get the perks that exist but for which there aren't any subscriptions
  const perkNamesToCreate = Array.from(perkSet).filter(
    (perkName) =>
      !subscriptionItems.map((subObj) => subObj.name).includes(perkName)
  );
  const perkObjectsToCreate = allPerks.filter((perk) =>
    perkNamesToCreate.includes(perk.Name)
  );

  try {
    await Promise.all(
      subscriptionsToCancel.map(async (subObj) => {
        await stripe.subscriptions.del(subObj.subscription_id);
      })
    );
  } catch (e) {
    console.log('Problem with deleting subscriptions');
    console.log(e);
  }

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

  try {
    await Promise.all(
      perkObjectsToCreate.map(async (perkObj) => {
        await stripe.subscriptions.create({
          customer: customerData.stripeId,
          items: [{ price: perkObj.stripePriceId }],
        });
      })
    );
  } catch (e) {
    console.log('Problem with creating subscriptions');
    console.log(e);
  }
};
