import { NextFunction, Response } from 'express';
import admin, { db } from '../../services';
import {
  adminPerkifyRequestTransform,
  checkValidationResult,
  updateStripeSubscription,
  validateAdminDoc,
  validateBusinessDoc,
  validateFirebaseIdToken,
} from '../../utils';

export const deletePerkGroupValidators = [
  validateFirebaseIdToken,
  validateAdminDoc,
  validateBusinessDoc,
  checkValidationResult,
];

export const deletePerkGroup = adminPerkifyRequestTransform(
  async (req: AdminPerkifyRequest, res: Response, next: NextFunction) => {
    const perkGroupName = req.params.perkGroupName;
    const adminData = req.adminData;
    const businessID = adminData.businessID;

    const preUpdateBusinessData = req.businessData;

    try {
      // delete group from businesss' perkGroups
      await db
        .collection('businesses')
        .doc(businessID)
        .update({
          [`perkGroups.${perkGroupName}`]: admin.firestore.FieldValue.delete(),
        });

      // update the stripe subscription
      await updateStripeSubscription(preUpdateBusinessData, next);

      res.status(200).end();
    } catch (err) {
      next(err);
    }
  }
);
