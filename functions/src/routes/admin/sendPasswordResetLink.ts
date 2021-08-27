import { NextFunction, Request, Response } from 'express';
import { param } from 'express-validator';
import { logger } from 'firebase-functions';
import admin, { db, functions } from '../../services';
import {
  checkValidationResult,
  emailNormalizationOptions,
  validateAdminEmail,
} from '../../utils';

export const sendPasswordResetLinkValidators = [
  param('adminEmail')
    .isEmail()
    .normalizeEmail(emailNormalizationOptions)
    .custom(validateAdminEmail),
  checkValidationResult,
];

export const sendPasswordResetLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminEmail = req.params.adminEmail as string;

    const passwordResetLink = await admin
      .auth()
      .generatePasswordResetLink(adminEmail, {
        url:
          functions.config()['stripe-firebase'].environment == 'production'
            ? 'https://app.getperkify.com/login'
            : functions.config()['stripe-firebase'].environment == 'staging'
            ? 'https://app.dev.getperkify.com/login'
            : 'http://localhost:3001/login',
      });

    // if in development mode, print the sign in link
    if (functions.config()['stripe-firebase'].environment == 'development') {
      logger.log(
        `Generated password reset link for ${adminEmail}`,
        passwordResetLink
      );
    }

    // send email
    await db.collection('mail').add({
      to: adminEmail,
      template: {
        name: 'adminPasswordReset',
        data: {
          passwordResetLink,
        },
      },
    });

    res.status(200).end();
  } catch (err) {
    next(err);
  }
};
