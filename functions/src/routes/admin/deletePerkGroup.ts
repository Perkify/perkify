import { body, validationResult } from 'express-validator';
import { validateEmails, sanitizeEmails, validatePerks } from 'utils';
import admin, { db } from 'models';
import { handleError } from 'middleware';
import { createUserHelper, deleteUserHelper } from 'utils';

export const deletePerkGroupValidators = [body('group').not().isEmpty()];

export const deletePerkGroup = async (req, res) => {
  const {
    group, // TODO: make this param
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

    // TOOD: create helper function to get business info from logged in admin
    // //const businessSnap = await db
    //     .collection("businesses")
    //     .doc(businessID)
    //     .get();

    // const walletID = businessSnap.data().walletID;

    const usersRef = db.collection('users');
    const groupUsersSnapshot = await usersRef.where('group', '==', group).get();

    if (!groupUsersSnapshot.empty) {
      const usersToDelete = [];
      groupUsersSnapshot.forEach((userDoc) => {
        usersToDelete.push(deleteUserHelper(userDoc));
      });
      await Promise.all(usersToDelete);
    }

    // delete group from businesss' groups
    await db
      .collection('businesses')
      .doc(businessID)
      .update({
        [`groups.${group}`]: admin.firestore.FieldValue.delete(),
      });

    res.status(200).end();
  } catch (err) {
    res.status(500).end();
  }
};
