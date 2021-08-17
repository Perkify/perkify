import { body, param } from 'express-validator';
import { db } from '../../models';
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
  validatePerks,
} from '../../utils';

export interface CreatePerkGroupPayload {
  perks: string[];
  emails: string[];
}

export const createPerkGroupValidators = [
  validateFirebaseIdToken,
  validateAdminDoc,
  validateBusinessDoc,
  param('perkGroupName').custom(validateNewPerkGroupName),
  body('emails')
    .custom(validateEmails)
    .customSanitizer(sanitizeEmails)
    .custom(checkIfAnyEmailsAreClaimed),
  body('perks').custom(validatePerks),
  checkValidationResult,
];

export const createPerkGroup = async (req, res, next) => {
  const perkGroupName = req.params.perkGroupName as string;
  const { emails, perks } = req.body as CreatePerkGroupPayload;
  const businessData = req.businessData as Business;

  try {
    // TODO: Change from id to businessID on Business interface

    // update the business document to reflect the group of perks
    await db
      .collection('businesses')
      .doc(businessData.businessID)
      .update({
        [`groups.${perkGroupName}`]: { perks, emails } as PerkGroup,
      });

    // update the stripe subscription
    await updateStripeSubscription(req.businessData);

    res.status(200).end();
  } catch (err) {
    next(err);
  }
};
