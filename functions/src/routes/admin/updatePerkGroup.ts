import { body, param } from 'express-validator';
import { db } from '../../models';
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
  validatePerks,
} from '../../utils';

export const updatePerkGroupValidators = [
  validateFirebaseIdToken,
  validateAdminDoc,
  validateBusinessDoc,
  param('perkGroupName').custom(validateExistingPerkGroupName),
  body('emails')
    .custom(validateEmails)
    .customSanitizer(sanitizeEmails)
    .custom(checkIfAnyEmailsToAddAreClaimed),
  body('perks').custom(validatePerks),
  checkValidationResult,
];

export const updatePerkGroup = async (req, res, next) => {
  const perkGroupName = req.params.perkGroupName;
  const { emails, perks } = req.body as PerkGroup;
  const adminData = req.adminData;
  const businessID = adminData.businessID;

  // TODO validate that you aren't adding any duplicate emails

  try {
    // update business doc
    // this makes pendingBusiness equal updatedBusiness
    await db
      .collection('businesses')
      .doc(businessID)
      .update({
        [`groups.${perkGroupName}`]: {
          perks,
          emails,
        } as PerkGroup,
      });

    // sync to stripe subscription
    await updateStripeSubscription(req.businessData);

    res.status(200).end();
  } catch (error) {
    res.status(500).end();
  }
};
