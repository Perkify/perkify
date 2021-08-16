// unknown, what happens during the hour that the invoice takes to process?
// doesn't matter, they will all be independent invoices
// and the subscription creation only happens once
// not going off of the subscription update

import { newUserTemplateGenerator } from '../../shared';
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

export const updateUserHelper = async (
  email,
  businessID,
  group,
  oldPerks,
  newPerks
) => {
  const docRef = db.collection('users').doc(email);

  const oldUserNewPerks = newPerks.reduce((acc, perk) => {
    if (perk in oldPerks) {
      acc[perk] = oldPerks[perk];
    } else {
      acc[perk] = [];
    }
    return acc;
  }, {});

  await docRef.set({
    businessID,
    group,
    perks: oldUserNewPerks,
  });

  // // does this create a user?
  // const signInLink = await admin.auth().generateSignInWithEmailLink(email, {
  //   url:
  //     functions.config()['stripe-firebase'].environment == 'production'
  //       ? 'https://app.getperkify.com/dashboard'
  //       : functions.config()['stripe-firebase'].environment == 'staging'
  //       ? 'https://app.dev.getperkify.com/dashboard'
  //       : 'http://localhost:3001/dashboard', // I don't think you're supposed to do it this way. Maybe less secure
  // });

  // // send email
  // await db.collection('mail').add({
  //   to: email,
  //   message: {
  //     subject: 'Your employer has signed you up for Perkify!',
  //     html: newUserTemplateGenerator({ signInLink }),
  //   },
  // });
};

export const deleteUserHelper = async (userDoc) => {
  if (userDoc.data().card)
    await stripe.issuing.cards.update(userDoc.data().card.id, {
      status: 'canceled',
    });
  await db.collection('users').doc(userDoc.id).delete();
};
