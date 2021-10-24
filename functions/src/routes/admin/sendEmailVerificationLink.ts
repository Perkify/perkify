import { NextFunction, Response } from 'express';
import { logger } from 'firebase-functions';
import admin, { db, functions } from '../../services';
import {
  adminPerkifyRequestTransform,
  checkValidationResult,
  validateAdminDoc,
  validateBusinessDoc,
  validateFirebaseIdToken,
} from '../../utils';

export const sendEmailVerificationLinkValidators = [
  validateFirebaseIdToken,
  validateAdminDoc,
  validateBusinessDoc,
  checkValidationResult,
];

export const sendEmailVerificationLink = adminPerkifyRequestTransform(
  async (req: AdminPerkifyRequest, res: Response, next: NextFunction) => {
    try {
      const verificationLink = await admin
        .auth()
        .generateEmailVerificationLink(req.adminData.email, {
          url:
            functions.config()['stripe-firebase'].environment == 'production'
              ? 'https://admin.getperkify.com/login'
              : functions.config()['stripe-firebase'].environment == 'staging'
              ? 'https://admin.dev.getperkify.com/login'
              : 'http://localhost:3000/login',
        });

      // if in development mode or staging mode, print the confirmation link
      if (
        ['development', 'staging'].includes(
          functions.config()['stripe-firebase'].environment
        )
      ) {
        logger.log(
          `Generated email verification link for ${req.adminData.email}`,
          verificationLink
        );
      }

      // send email
      await db.collection('mail').add({
        to: req.adminData.email,
        template: {
          name: 'adminEmailConfirmation',
          data: {
            name: `${req.adminData.firstName} ${req.adminData.lastName}`,
            email: req.adminData.email,
            verificationLink,
          },
        },
      });

      res.status(200).end();
    } catch (err) {
      next(err);
    }
  }
);
