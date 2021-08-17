import { body, param } from 'express-validator';
import { db } from '../../models';
import {
  checkValidationResult,
  sanitizeEmails,
  updateStripeSubscription,
  validateAdminDoc,
  validateBusinessDoc,
  validateEmails,
  validateExistingPerkGroupName,
  validateFirebaseIdToken,
  validatePerks,
} from '../../utils';

export const updatePerkGroupValidators = [
  validateFirebaseIdToken,
  validateAdminDoc,
  validateBusinessDoc,
  param('perkGroupName').custom(validateExistingPerkGroupName),
  body('emails').custom(validateEmails).customSanitizer(sanitizeEmails),
  body('perks').custom(validatePerks),
  checkValidationResult,
];

export const updatePerkGroup = async (req, res, next) => {
  const perkGroupName = req.params.perkGroupName;
  const { emails, perks } = req.body;
  const adminData = req.adminData;
  const businessID = adminData.businessID;

  // TODO validate that perkGroupName exists
  // TODO validate that you aren't adding any duplicate emails

  try {
    // update business doc
    await db
      .collection('businesses')
      .doc(businessID)
      .update({
        [`groups.${perkGroupName}`]: {
          perks,
          employees: emails,
        } as PerkGroup,
      });

    // sync to stripe subscription
    await updateStripeSubscription(businessID);

    res.status(200).end();
  } catch (error) {
    res.status(500).end();
  }
};
