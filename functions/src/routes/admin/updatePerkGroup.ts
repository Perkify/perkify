import { NextFunction, Response } from 'express';
import { body, param } from 'express-validator';
import { db } from '../../services';
import { AdminPerkifyRequest, adminPerkifyRequestTransform } from '../../types';
import {
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
  param('perkGroupName').custom(validateExistingPerkGroupName),
  body('userEmails')
    .custom(validateEmails)
    .customSanitizer(sanitizeEmails)
    .custom(checkIfAnyEmailsToAddAreClaimed),
  body('perkNames').custom(validatePerkNames),
  checkValidationResult,
];

export const updatePerkGroup = adminPerkifyRequestTransform(
  async (req: AdminPerkifyRequest, res: Response, next: NextFunction) => {
    const perkGroupName = req.params.perkGroupName;
    const { userEmails: emails, perkNames } =
      req.body as UpdatePerkGroupPayload;
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
            userEmails: emails,
          } as PerkGroup,
        });

      // sync to stripe subscription
      await updateStripeSubscription(preUpdateBusinessData);

      res.status(200).end();
    } catch (error) {
      next(error);
    }
  }
);
