import { NextFunction, Response } from 'express';
import { body, param } from 'express-validator';
import { db } from '../../services';
import { AdminPerkifyRequest, adminPerkifyRequestTransform } from '../../types';
import {
  checkIfAnyEmailsAreClaimed,
  checkValidationResult,
  sanitizeEmails,
  updateStripeSubscription,
  validateAdminDoc,
  validateBusinessDoc,
  validateEmails,
  validateFirebaseIdToken,
  validateNewPerkGroupName,
  validatePerkNames,
} from '../../utils';

export const createPerkGroupValidators = [
  validateFirebaseIdToken,
  validateAdminDoc,
  validateBusinessDoc,
  param('perkGroupName').custom(validateNewPerkGroupName),
  body('emails')
    .custom(validateEmails)
    .customSanitizer(sanitizeEmails)
    .custom(checkIfAnyEmailsAreClaimed),
  body('perkNames').custom(validatePerkNames),
  checkValidationResult,
];

export const createPerkGroup = adminPerkifyRequestTransform(
  async (req: AdminPerkifyRequest, res: Response, next: NextFunction) => {
    const perkGroupName = req.params.perkGroupName as string;
    const { emails, perkNames } = req.body as CreatePerkGroupPayload;
    const businessData = req.businessData as Business;

    try {
      // update the business document to reflect the group of perkNames

      await db
        .collection('businesses')
        .doc(businessData.businessID)
        .update({
          [`perkGroups.${perkGroupName}`]: {
            perkNames: perkNames,
            userEmails: emails,
          } as PerkGroup,
        });

      // update the stripe subscription
      await updateStripeSubscription(req.businessData.businessID);

      res.status(200).end();
    } catch (err) {
      next(err);
    }
  }
);
