import { NextFunction, Request, Response } from 'express';
import { param } from 'express-validator';
import { logger } from 'firebase-functions';
import admin, { db, functions } from '../../services';
import {
  checkValidationResult,
  emailNormalizationOptions,
  validateUserEmail,
} from '../../utils';

export const sendSignInLinkValidators = [
  param('userEmail')
    .isEmail()
    .normalizeEmail(emailNormalizationOptions)
    .custom(validateUserEmail),
  checkValidationResult,
];

export const sendSignInLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userEmail = req.params.userEmail as string;

    const signInLink = await admin
      .auth()
      .generateSignInWithEmailLink(userEmail, {
        url:
          functions.config()['stripe-firebase'].environment == 'production'
            ? 'https://app.getperkify.com/dashboard'
            : functions.config()['stripe-firebase'].environment == 'staging'
            ? 'https://app.dev.getperkify.com/dashboard'
            : 'http://localhost:3001/dashboard',
      });

    // if in development or staging mode, print the sign in link
    if (
      ['development', 'staging'].includes(
        functions.config()['stripe-firebase'].environment
      )
    ) {
      logger.log(`Generated sign in link for ${userEmail}`, signInLink);
    }

    // send email
    await db.collection('mail').add({
      to: userEmail,
      template: {
        name: 'userSignInLink',
        data: {
          signInLink,
        },
      },
    });

    res.status(200).end();
  } catch (err) {
    next(err);
  }
};
