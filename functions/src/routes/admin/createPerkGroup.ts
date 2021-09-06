import { NextFunction, Response } from 'express';
import { body } from 'express-validator';
import { db } from '../../services';
import { AdminPerkifyRequest, adminPerkifyRequestTransform } from '../../types';
import {
  checkEmployeesExist,
  checkValidationResult,
  updateStripeSubscription,
  validateAdminDoc,
  validateBusinessDoc,
  validateFirebaseIdToken,
  validateNewPerkGroupName,
  validatePerkNames,
} from '../../utils';

export const createPerkGroupValidators = [
  validateFirebaseIdToken,
  validateAdminDoc,
  validateBusinessDoc,
  body('employeeIDs').custom(checkEmployeesExist),
  body('perkNames').custom(validatePerkNames),
  body('perkGroupName').custom(validateNewPerkGroupName),
  checkValidationResult,
];

export const createPerkGroup = adminPerkifyRequestTransform(
  async (req: AdminPerkifyRequest, res: Response, next: NextFunction) => {
    const { employeeIDs, perkNames, perkGroupName } =
      req.body as CreatePerkGroupPayload;
    const businessData = req.businessData as Business;

    const preUpdateBusinessData = req.businessData;

    try {
      // update the business document to reflect the group of perkNames

      // generate a random id using business collection but doesn't actually edit db
      const perkGroupID = db.collection('businesses').doc().id;

      const newPerkGroup: PerkGroup = {
        perkGroupName,
        perkNames,
        employeeIDs,
      };

      await db
        .collection('businesses')
        .doc(businessData.businessID)
        .update({
          [`perkGroups.${perkGroupID}`]: newPerkGroup,
        });

      // add all the employees to group
      for (const employeeID of employeeIDs) {
        await db
          .collection('businesses')
          .doc(businessData.businessID)
          .collection('employees')
          .doc(employeeID)
          .update({ perkGroupID });
      }

      // update the stripe subscription
      await updateStripeSubscription(preUpdateBusinessData, next);

      res.status(200).end();
    } catch (err) {
      next(err);
    }
  }
);
