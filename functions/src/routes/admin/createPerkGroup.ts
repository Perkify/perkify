import { body } from 'express-validator';
import { db } from '../../models';
import {
  checkIfAnyEmailsAreClaimed,
  checkValidationResult,
  sanitizeEmails,
  updateStripeSubscription,
  validateAdminDoc,
  validateEmails,
  validateFirebaseIdToken,
  validatePerks,
} from '../../utils';

export const createPerkGroupValidators = [
  validateFirebaseIdToken,
  validateAdminDoc,
  body('emails')
    .custom(validateEmails)
    .custom(checkIfAnyEmailsAreClaimed)
    .customSanitizer(sanitizeEmails),
  body('perks').custom(validatePerks),
  checkValidationResult,
];

export const createPerkGroup = async (req, res, next) => {
  // TODO validate that a group with that name doesn't already exist

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
