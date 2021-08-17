import admin, { db } from '../../models';
import {
  checkValidationResult,
  updateStripeSubscription,
  validateAdminDoc,
  validateFirebaseIdToken,
} from '../../utils';

export const deletePerkGroupValidators = [
  validateFirebaseIdToken,
  validateAdminDoc,
  checkValidationResult,
];

export const deletePerkGroup = async (req, res, next) => {
  const perkGroupName = req.params.perkGroupName;
  const adminData = req.adminData;
  const businessID = adminData.businessID;

  try {
    // delete group from businesss' groups
    await db
      .collection('businesses')
      .doc(businessID)
      .update({
        [`groups.${perkGroupName}`]: admin.firestore.FieldValue.delete(),
      });

    // update the stripe subscription
    await updateStripeSubscription(businessID);

    // sync stripe subscriptions with perks
    res.status(200).end();
  } catch (err) {
    next(err);
  }
};
