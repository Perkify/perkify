import { body, validationResult } from 'express-validator';
import { db } from '../../models';
import {
  createUserHelper,
  deleteUserHelper,
  sanitizeEmails,
  syncStripeSubscriptionsWithFirestorePerks,
  validateEmails,
} from '../../utils';

export const updatePerkGroupValidators = [
  body('group').not().isEmpty(),
  body('emails').custom(validateEmails).customSanitizer(sanitizeEmails),
];

export const updatePerkGroup = async (req, res, next) => {
  const {
    group, // TODO: make this param
    emails,
    perks,
  } = req.body;

  try {
    const errors = validationResult(req);
    console.log(errors, errors.isEmpty());
    if (!errors.isEmpty()) {
      const error = {
        status: 400,
        reason: 'Bad Request',
        reasonDetail: JSON.stringify(errors.array()),
      };
      return next(error);
    }

    // prevent from duplicate perks being passed at once
    if (perks && new Set(perks).size !== perks.length) {
      const error = {
        status: 400,
        reason: 'Bad Request',
        reasonDetail: 'Trying to add duplicate perks',
      };
      return next(error);
    }

    console.log('Starting update perk group');

    // get admins business
    const adminData = (
      await db.collection('admins').doc(req.user.uid).get()
    ).data();

    if (!adminData) {
      const error = {
        status: 500,
        reason: 'Missing documents',
        reasonDetail: `Documents missing from firestore`,
      };
      return next(error);
    }

    const businessID = adminData.companyID;

    // if perks defined, reassign perks
    if (perks && perks.length != 0) {
      await db
        .collection('businesses')
        .doc(businessID)
        .update({
          [`groups.${group}`]: perks,
        });
    }

    const usersRef = db.collection('users');
    const groupUsersSnapshot = await usersRef.where('group', '==', group).get();

    const deleteUsers: any[] = [];
    const oldUserEmails: any[] = [];

    // partition existing emails into those to delete and those not to delete
    groupUsersSnapshot.forEach((userDoc) => {
      if (emails.includes(userDoc.id)) {
        oldUserEmails.push(userDoc.id);
      } else {
        deleteUsers.push(userDoc);
      }
    });

    // get emails that weren't already added
    const addUserEmails = emails.filter(
      (email) => !oldUserEmails.includes(email)
    );

    // move this to a function
    for (const email of addUserEmails) {
      const docRef = db.collection('users').doc(email);

      const docSnapshot = await docRef.get();
      if (docSnapshot.exists) {
        const error = {
          status: 400,
          reason: 'Bad Request',
          reasonDetail: `added email ${email} that is already in another group`,
        };
        return next(error);
      }
    }

    // TODO: move this to a function as well and create multiple files
    const usersToCreate = addUserEmails.map((email) =>
      createUserHelper(email, businessID, group, perks)
    );
    await Promise.all(usersToCreate);

    // TODO: move this to a function as well and create multiple files
    const usersToDelete = deleteUsers.map((user) => deleteUserHelper(user));
    await Promise.all(usersToDelete);

    try {
      await syncStripeSubscriptionsWithFirestorePerks(req.user.uid, businessID);
    } catch (e) {
      return next(e);
    }

    res.status(200).end();
  } catch (err) {
    // TODO: if globalWalletID is set then use rapid api to delete the wallet
    // handleError(err, res);
    console.log(err);

    res.status(500).end();
  }
};
