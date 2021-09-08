import { NextFunction, Response } from 'express';
import { param } from 'express-validator';
import admin, { db } from '../../services';
import { AdminPerkifyRequest, adminPerkifyRequestTransform } from '../../types';
import {
  checkValidationResult,
  updateStripeSubscription,
  validateAdminDoc,
  validateBusinessDoc,
  validateExistingPerkGroupID,
  validateFirebaseIdToken,
} from '../../utils';

export const deletePerkGroupValidators = [
  validateFirebaseIdToken,
  validateAdminDoc,
  validateBusinessDoc,
  param('perkGroupID').custom(validateExistingPerkGroupID),
  checkValidationResult,
];

export const deletePerkGroup = adminPerkifyRequestTransform(
  async (req: AdminPerkifyRequest, res: Response, next: NextFunction) => {
    const perkGroupID = req.params.perkGroupID;
    const adminData = req.adminData;
    const businessID = adminData.businessID;

    const preUpdateBusinessData = req.businessData;

    try {
      // delete group from businesss' perkGroups
      await db
        .collection('businesses')
        .doc(businessID)
        .update({
          [`perkGroups.${perkGroupID}`]: admin.firestore.FieldValue.delete(),
        });

      // update the stripe subscription
      await updateStripeSubscription(preUpdateBusinessData, next);

      res.status(200).end();
    } catch (err) {
      next(err);
    }
  }
);
