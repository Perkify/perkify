import { body, validationResult } from 'express-validator';
import { db } from '../../models';
import {
  sanitizeEmails,
  syncStripeSubscriptionsWithFirestorePerks,
  validateEmails,
} from '../../utils';

export const updatePerkGroupValidators = [
  body('group').not().isEmpty(),
  body('emails').custom(validateEmails).customSanitizer(sanitizeEmails),
];

export const updatePerkGroup = async (req, res, next) => {
  const { group, emails } = req.body;
  let { perks } = req.body;

  try {
    const errors = validationResult(req);
    console.log(errors, errors.isEmpty());
    if (!errors.isEmpty()) {
      const error = {
        status: 400,
        reason: 'Bad Request',
        reasonDetail: JSON.stringify(errors.array()),
      };
      return next(error);
    }

    // prevent from duplicate perks being passed at once
    if (perks && new Set(perks).size !== perks.length) {
      const error = {
        status: 400,
        reason: 'Bad Request',
        reasonDetail: 'Trying to add duplicate perks',
      };
      return next(error);
    }

    console.log('Starting update perk group');

    // get admins business
    const adminData = (
      await db.collection('admins').doc(req.user.uid).get()
    ).data();

    if (!adminData) {
      const error = {
        status: 500,
        reason: 'Missing documents',
        reasonDetail: `Documents missing from firestore`,
      };
      return next(error);
    }

    const businessID = adminData.companyID;

    // if perks defined, reassign perks
    if (perks && perks.length != 0) {
      await db
        .collection('businesses')
        .doc(businessID)
        .update({
          [`groups.${group}`]: { perks, employees: emails } as PerkGroup,
        });
    } else if (!perks) {
      const businessData = (
        await db.collection('businesses').doc(businessID).get()
      ).data();
      perks = businessData?.groups[group];
    }

    try {
      await syncStripeSubscriptionsWithFirestorePerks(
        req.user.uid,
        businessID,
        group
      );
    } catch (e) {
      return next(e);
    }

    res.status(200).end();
  } catch (err) {
    // TODO: if globalWalletID is set then use rapid api to delete the wallet
    // handleError(err, res);
    console.log(err);

    res.status(500).end();
  }
};
