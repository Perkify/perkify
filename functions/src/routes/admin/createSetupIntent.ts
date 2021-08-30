import { NextFunction, Response } from 'express';
import { stripe } from '../../services';
import { AdminPerkifyRequest, adminPerkifyRequestTransform } from '../../types';
import {
  checkValidationResult,
  validateAdminDoc,
  validateBusinessDoc,
  validateFirebaseIdToken,
} from '../../utils';

export const createSetupIntentValidators = [
  validateFirebaseIdToken,
  validateAdminDoc,
  validateBusinessDoc,
  checkValidationResult,
];

export const createSetupIntent = adminPerkifyRequestTransform(
  async (req: AdminPerkifyRequest, res: Response, next: NextFunction) => {
    const businessData = req.businessData;

    const intent = await stripe.setupIntents.create({
      customer: businessData.businessID,
    });

    res.json({ setupIntentClientSecret: intent.client_secret });
  }
);
