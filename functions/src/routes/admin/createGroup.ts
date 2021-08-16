import { body, validationResult } from 'express-validator';
import { db } from '../../models';
import {
  checkIfAnyEmailsAreClaimed,
  handleError,
  sanitizeEmails,
  updateStripeSubscription,
  validateEmails,
  validatePerks,
} from '../../utils';

export const createGroupValidators = [
  body('perkGroup').not().isEmpty(),
  body('emails').custom(validateEmails).customSanitizer(sanitizeEmails),
  body('perks').custom(validatePerks),
];

export const createGroup = async (req, res, next) => {
  const {
    perkGroupName, // TODO: make this param
    emails,
    perks,
    ...rest
  } = req.body;

  try {
    // request validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = {
        status: 400,
        reason: 'Bad Request',
        reasonDetail: JSON.stringify(errors.array()),
      };
      return next(error);
    }

    if (Object.keys(rest).length > 0) {
      const error = {
        status: 400,
        reason: 'extraneous parameters',
        reasonDetail: Object.keys(rest).join(','),
      };
      return next(error);
    }

    // make sure all emails are good
    await checkIfAnyEmailsAreClaimed(emails);

    // // make sure all emails are good
    // for (const email of emails) {
    //   const docRef = db.collection('users').doc(email);

    //   const docSnapshot = await docRef.get();
    //   if (docSnapshot.exists && docSnapshot.data()?.businessID) {
    //     const error = {
    //       status: 400,
    //       reason: 'Bad Request',
    //       reasonDetail: `added email ${email} that is already in another group`,
    //     };
    //     return next(error);
    //   }
    // }

    // get admins business
    const adminData = (
      await db.collection('admins').doc(req.user.uid).get()
    ).data();

    if (adminData == null) {
      const error = {
        status: 500,
        reason: 'Missing admin document',
        reasonDetail: `Documents admin document in firestore`,
      };
      return next(error);
    }

    const businessID = adminData.businessID;

    // update the business document to reflect the group of perks

    await db
      .collection('businesses')
      .doc(businessID)
      .update({
        [`groups.${perkGroupName}`]: { perks, employees: emails } as PerkGroup,
      });

    try {
      await updateStripeSubscription(businessID);
    } catch (e) {
      return next(e);
    }

    res.status(200).end();
  } catch (err) {
    // TODO: if globalWalletID is set then use rapid api to delete the wallet
    handleError(err, res);
  }
};
