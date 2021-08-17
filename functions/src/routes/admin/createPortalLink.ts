import { NextFunction, Response } from 'express';
import { body } from 'express-validator';
import { stripe } from '../../services';
import { AdminPerkifyRequest, adminPerkifyRequestTransform } from '../../types';
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
export const createPortalLink = adminPerkifyRequestTransform(
  async (req: AdminPerkifyRequest, res: Response, next: NextFunction) => {
    const { returnUrl } = req.body as CreatePortalLinkPayload;
    const uid = req.user.uid;
    const businessData = req.businessData;

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
  }
);
