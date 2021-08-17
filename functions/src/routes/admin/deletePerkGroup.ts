import { NextFunction, Response } from 'express';
import admin, { db } from '../../services';
import { AdminPerkifyRequest, adminPerkifyRequestTransform } from '../../types';
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

export const deletePerkGroup = adminPerkifyRequestTransform(
  async (req: AdminPerkifyRequest, res: Response, next: NextFunction) => {
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
      await updateStripeSubscription(req.businessData);

      // sync stripe subscriptions with perks
      res.status(200).end();
    } catch (err) {
      next(err);
    }
  }
);
