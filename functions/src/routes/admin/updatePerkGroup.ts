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

export interface UpdatePerkGroupPayload {
  perkNames: string[];
  emails: string[];
}

export const updatePerkGroupValidators = [
  validateFirebaseIdToken,
  validateAdminDoc,
  validateBusinessDoc,
  param('perkGroupName').custom(validateExistingPerkGroupName),
  body('emails')
    .custom(validateEmails)
    .customSanitizer(sanitizeEmails)
    .custom(checkIfAnyEmailsToAddAreClaimed),
  body('perkNames').custom(validatePerkNames),
  checkValidationResult,
];

export const updatePerkGroup = adminPerkifyRequestTransform(
  async (req: AdminPerkifyRequest, res: Response, next: NextFunction) => {
    const perkGroupName = req.params.perkGroupName;
    const { emails, perkNames } = req.body as UpdatePerkGroupPayload;
    const adminData = req.adminData;
    const businessID = adminData.businessID;

    try {
      // update business doc
      // this makes pendingBusiness equal updatedBusiness
      await db
        .collection('businesses')
        .doc(businessID)
        .update({
          [`groups.${perkGroupName}`]: {
            perkNames: perkNames,
            emails,
          } as PerkGroup,
        });

      // sync to stripe subscription
      await updateStripeSubscription(req.businessData);

      res.status(200).end();
    } catch (error) {
      res.status(500).end();
    }
  }
);
