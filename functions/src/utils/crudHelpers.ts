import { firestore } from 'firebase-admin/lib/firestore';
import { logger } from 'firebase-functions';
import admin, { db, functions, stripe } from '../services';
import { applyChangesToLiveUsers } from './applyChangesToLiveUsers';
import FieldValue = firestore.FieldValue;

export const createUserHelper = async (userToCreate: UserToCreate) => {
  const docRef = db
    .collection('businesses')
    .doc(userToCreate.businessID)
    .collection('employees')
    .doc(userToCreate.employeeID);

  const user: { perkGroupID: string; perkUsesDict: PerkUsesDict } = {
    perkGroupID: userToCreate.perkGroupID,
    perkUsesDict: userToCreate.newPerkNames.reduce(
      (map, perk) => ((map[perk] = []), map),
      {} as { [key: string]: FirebaseFirestore.Timestamp[] }
    ),
  };

  await docRef.update(user);

  const signInLink = await admin
    .auth()
    .generateSignInWithEmailLink(userToCreate.email, {
      url:
        functions.config()['stripe-firebase'].environment == 'production'
          ? 'https://app.getperkify.com/dashboard'
          : functions.config()['stripe-firebase'].environment == 'staging'
          ? 'https://app.dev.getperkify.com/dashboard'
          : 'http://localhost:3001/dashboard',
    });

  // if in development or staging mode, print the sign in link
  if (
    ['development', 'staging'].includes(
      functions.config()['stripe-firebase'].environment
    )
  ) {
    logger.log(`Generated sign in link for ${userToCreate.email}`, signInLink);
  }

  // send email
  await db.collection('mail').add({
    to: userToCreate.email,
    template: {
      name: 'userOnboarding',
      data: {
        businessName: userToCreate.businessName,
        perks:
          userToCreate.newPerkNames.length > 1
            ? userToCreate.newPerkNames.slice(0, -1).join(', ') +
              ', and ' +
              userToCreate.newPerkNames[userToCreate.newPerkNames.length - 1]
            : userToCreate.newPerkNames[0],
        signInLink,
      },
    },
  });
};

export const updateUserHelper = async (userToUpdate: UserToUpdate) => {
  const docRef = db
    .collection('businesses')
    .doc(userToUpdate.businessID)
    .collection('employees')
    .doc(userToUpdate.employeeID);

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
  } as Partial<Employee>);

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
  await db
    .collection('businesses')
    .doc(userToDelete.businessID)
    .collection('employees')
    .doc(userToDelete.employeeID)
    .update({
      perkGroupID: FieldValue.delete(),
      perkUsesDict: FieldValue.delete(),
    });
};

export const expandUsers = async (updatedBusiness: Business) => {
  await applyChangesToLiveUsers(updatedBusiness, 'expand');
};

export const shrinkUsers = async (updatedBusiness: Business) => {
  await applyChangesToLiveUsers(updatedBusiness, 'shrink');
};
