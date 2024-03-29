import { NextFunction, Response } from 'express';
import { body, param } from 'express-validator';
import { db } from '../../services';
import {
  adminPerkifyRequestTransform,
  checkEmployeesExistInBusiness,
  checkValidationResult,
  updateStripeSubscription,
  validateAdminDoc,
  validateBusinessDoc,
  validateExistingPerkGroupID,
  validateFirebaseIdToken,
  validatePerkNames,
} from '../../utils';

export const updatePerkGroupValidators = [
  validateFirebaseIdToken,
  validateAdminDoc,
  validateBusinessDoc,
  body('employeeIDs').custom(checkEmployeesExistInBusiness),
  body('perkNames').custom(validatePerkNames),
  param('perkGroupID').custom(validateExistingPerkGroupID),
  checkValidationResult,
];

export const updatePerkGroup = adminPerkifyRequestTransform(
  async (req: AdminPerkifyRequest, res: Response, next: NextFunction) => {
    const perkGroupID = req.params.perkGroupID;
    const { employeeIDs, perkNames, perkGroupName } =
      req.body as UpdatePerkGroupPayload;
    const adminData = req.adminData;
    const businessID = adminData.businessID;

    const preUpdateBusinessData = req.businessData;

    try {
      // update business doc
      // this makes pendingBusiness equal updatedBusiness

      const newPerkGroup: PerkGroup = {
        perkGroupName,
        perkNames,
        employeeIDs,
      };

      await db
        .collection('businesses')
        .doc(businessID)
        .update({
          [`perkGroups.${perkGroupID}`]: newPerkGroup,
        });

      // sync to stripe subscription
      await updateStripeSubscription(preUpdateBusinessData, next);

      res.status(200).end();
    } catch (error) {
      next(error);
    }
  }
);
