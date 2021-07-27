import { body, validationResult } from 'express-validator';
import { db } from '../../models';
import {
  createUserHelper,
  deleteUserHelper,
  sanitizeEmails,
  validateEmails,
} from '../../utils';

export const updatePerkGroupValidators = [
  body('group').not().isEmpty(),
  body('emails').custom(validateEmails).customSanitizer(sanitizeEmails),
];

export const updatePerkGroup = async (req, res) => {
  const {
    group, // TODO: make this param
    emails,
    perks,
  } = req.body;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = {
        status: 400,
        reason: 'Bad Request',
        reason_detail: JSON.stringify(errors.array()),
      };
      throw error;
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
        reason_detail: `Documents missing from firestore`,
      };
      throw error;
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
          reason_detail: `added email ${email} that is already in another group`,
        };
        throw error;
      }
    }
    console.log(deleteUsers);

    // TODO: move this to a function as well and create multiple files
    const usersToCreate = addUserEmails.map((email) =>
      createUserHelper(email, businessID, group, perks)
    );
    await Promise.all(usersToCreate);

    // TODO: move this to a function as well and create multiple files
    const usersToDelete = deleteUsers.map((user) => deleteUserHelper(user));
    await Promise.all(usersToDelete);

    res.status(200).end();
  } catch (err) {
    // TODO: if globalWalletID is set then use rapid api to delete the wallet
    // handleError(err, res);
    console.log(err);

    res.status(500).end();
  }
};
