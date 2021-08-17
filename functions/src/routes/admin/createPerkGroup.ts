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
  validatePerks,
  validateUniquePerkGroupName,
} from '../../utils';

export const createPerkGroupValidators = [
  validateFirebaseIdToken,
  validateAdminDoc,
  validateBusinessDoc,
  param('perkGroupName').exists().custom(validateUniquePerkGroupName),
  body('emails')
    .custom(validateEmails)
    .custom(checkIfAnyEmailsAreClaimed)
    .customSanitizer(sanitizeEmails),
  body('perks').custom(validatePerks),
  checkValidationResult,
];

export const createPerkGroup = async (req, res, next) => {
  const perkGroupName = req.params.perkGroupName;
  const { emails, perks } = req.body;
  const adminData = req.adminData;
  const businessID = adminData.businessID;

  try {
    // update the business document to reflect the group of perks
    await db
      .collection('businesses')
      .doc(businessID)
      .update({
        [`groups.${perkGroupName}`]: { perks, employees: emails } as PerkGroup,
      });

    // update the stripe subscription
    await updateStripeSubscription(businessID);

    res.status(200).end();
  } catch (err) {
    next(err);
  }
};
