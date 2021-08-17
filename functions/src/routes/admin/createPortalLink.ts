import { body } from 'express-validator';
import { stripe } from '../../models';
import {
  checkValidationResult,
  validateAdminDoc,
  validateBusinessDoc,
  validateFirebaseIdToken,
} from '../../utils';

export const createPortalLinkValidators = [
  validateFirebaseIdToken,
  validateAdminDoc,
  validateBusinessDoc,
  body('returnUrl').not().isEmpty(),
  checkValidationResult,
];
/**
 * Create a billing portal link
 */
export const createPortalLink = async (req, res, next) => {
  const { returnUrl } = req.body;
  const uid = req.user.uid;
  const businessData = req.businessData as Business;

  try {
    if (!uid) throw new Error('Not authenticated!');
    const return_url = returnUrl;

    const session = await stripe.billingPortal.sessions.create({
      customer: businessData.stripeId,
      return_url,
    });

    res.status(200).json(session).end();
  } catch (error) {
    next(error);
  }
};
