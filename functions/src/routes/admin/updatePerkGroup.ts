import { NextFunction, Response } from 'express';
import { body, param } from 'express-validator';
import { db } from '../../services';
import {
  adminPerkifyRequestTransform,
  checkIfAnyEmailsToAddAreClaimed,
  checkValidationResult,
  sanitizeEmails,
  updateStripeSubscription,
  validateAdminDoc,
  validateBusinessDoc,
  validateEmails,
  validateExistingPerkGroupName,
  validateFirebaseIdToken,
  validatePerkNames,
} from '../../utils';

export const updatePerkGroupValidators = [
  validateFirebaseIdToken,
  validateAdminDoc,
  validateBusinessDoc,
  body('userEmails')
    .custom(validateEmails)
    .customSanitizer(sanitizeEmails)
    .custom(checkIfAnyEmailsToAddAreClaimed),
  body('perkNames').custom(validatePerkNames),
  param('perkGroupName').custom(validateExistingPerkGroupName),
  checkValidationResult,
];

export const updatePerkGroup = adminPerkifyRequestTransform(
  async (req: AdminPerkifyRequest, res: Response, next: NextFunction) => {
    const perkGroupName = req.params.perkGroupName;
    const { userEmails, perkNames } = req.body as UpdatePerkGroupPayload;
    const adminData = req.adminData;
    const businessID = adminData.businessID;

    const preUpdateBusinessData = req.businessData;

    try {
      // update business doc
      // this makes pendingBusiness equal updatedBusiness
      await db
        .collection('businesses')
        .doc(businessID)
        .update({
          [`perkGroups.${perkGroupName}`]: {
            perkNames: perkNames,
            userEmails: userEmails,
          } as PerkGroup,
        });

      // sync to stripe subscription
      await updateStripeSubscription(preUpdateBusinessData, next);

      res.status(200).end();
    } catch (error) {
      next(error);
    }
  }
);
