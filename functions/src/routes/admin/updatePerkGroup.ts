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

    // get admins business
    const adminSnap = await db.collection('admins').doc(req.user.uid).get();
    const businessID = adminSnap.data().companyID;

    if (perks.length != 0) {
      await db
        .collection('businesses')
        .doc(businessID)
        .update({
          [`groups.${group}`]: perks,
        });
    }

    const usersRef = db.collection('users');
    const groupUsersSnapshot = await usersRef.where('group', '==', group).get();

    const deleteUsers = [];
    const oldUserEmails = [];
    groupUsersSnapshot.forEach(async (userDoc) => {
      if (emails.includes(userDoc.id)) {
        oldUserEmails.push(userDoc.id);
        const oldUserPerks = userDoc.data().perks;
        const oldUserNewPerks = perks.reduce((acc, perk) => {
          if (perk in oldUserPerks) {
            acc[perk] = oldUserPerks[perk];
          } else {
            acc[perk] = [];
          }
          return acc;
        }, {});
        await db
          .collection('users')
          .doc(userDoc.id)
          .update({ perks: oldUserNewPerks });
      } else {
        deleteUsers.push(userDoc);
      }
    });

    // add users
    const addUserEmails = emails.filter(
      (email) => !oldUserEmails.includes(email)
    );

    // TODO: move this to a function
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
    res.status(500).end();
  }
};
