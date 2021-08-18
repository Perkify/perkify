// unknown, what happens during the hour that the invoice takes to process?
// doesn't matter, they will all be independent invoices
// and the subscription creation only happens once
// not going off of the subscription update

import { newUserTemplateGenerator } from '../../shared';
import admin, { db, functions, stripe } from '../services';
import { applyChangesToLiveUsers } from './applyChangesToLiveUsers';

export const createUserHelper = async (userToCreate: UserToCreate) => {
  const docRef = db.collection('users').doc(userToCreate.email);

  await docRef.set({
    businessID: userToCreate.businessID,
    perkGroupName: userToCreate.perkGroupName,
    perkUsesDict: userToCreate.newPerkNames.reduce(
      (map, perk) => ((map[perk] = []), map),
      {} as { [key: string]: FirebaseFirestore.Timestamp[] }
    ),
  } as SimpleUser);

  const signInLink = await admin
    .auth()
    .generateSignInWithEmailLink(userToCreate.email, {
      url:
        functions.config()['stripe-firebase'].environment == 'production'
          ? 'https://app.getperkify.com/dashboard'
          : functions.config()['stripe-firebase'].environment == 'staging'
          ? 'https://app.dev.getperkify.com/dashboard'
          : 'http://localhost:3001/dashboard', // I don't think you're supposed to do it this way. Maybe less secure
    });

  if (functions.config()['stripe-firebase'].environment == 'development') {
    console.log(signInLink);
  }

  // send email
  await db.collection('mail').add({
    to: userToCreate.email,
    message: {
      subject: 'Your employer has signed you up for Perkify!',
      html: newUserTemplateGenerator({ signInLink }),
    },
  });
};

export const updateUserHelper = async (userToUpdate: UserToUpdate) => {
  const docRef = db.collection('users').doc(userToUpdate.email);

  const updatedPerkUsesDict = userToUpdate.newPerkNames.reduce((acc, perk) => {
    if (perk in userToUpdate.oldPerkUsesDict) {
      acc[perk] = userToUpdate.oldPerkUsesDict[perk];
    } else {
      acc[perk] = [];
    }
    return acc;
  }, {} as PerkUsesDict);

  await docRef.update({
    perkUsesDict: updatedPerkUsesDict,
  } as Partial<User>);

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

export const deleteUserHelper = async (userToDelete: UserToDelete) => {
  // if user has a card, delete it
  if (userToDelete.card) {
    await stripe.issuing.cards.update(userToDelete.card.id, {
      status: 'canceled',
    });
  }
  await db.collection('users').doc(userToDelete.email).delete();
};

export const expandUsers = async (updatedBusiness: Business) => {
  applyChangesToLiveUsers(updatedBusiness, 'expand');
};

export const shrinkUsers = async (updatedBusiness: Business) => {
  applyChangesToLiveUsers(updatedBusiness, 'shrink');
};
