import { NextFunction, Response } from 'express';
import { param } from 'express-validator';
import { db, stripe } from '../../services';
import { AdminPerkifyRequest, adminPerkifyRequestTransform } from '../../types';
import {
  checkValidationResult,
  validateAdminDoc,
  validateBusinessDoc,
  validateFirebaseIdToken,
} from '../../utils';

export const setDefaultPaymentMethodValidators = [
  validateFirebaseIdToken,
  validateAdminDoc,
  validateBusinessDoc,
  param('paymentMethodID').notEmpty(),
  checkValidationResult,
];

export const setDefaultPaymentMethod = adminPerkifyRequestTransform(
  async (req: AdminPerkifyRequest, res: Response, next: NextFunction) => {
    const paymentMethodID = req.params.paymentMethodID;
    const businessData = req.businessData;

    // get the business payment methods
    const cardPaymentMethods = req.businessData.cardPaymentMethods;

    const simpleCardToBeDefault = Object.values(cardPaymentMethods).filter(
      (simpleCard) => simpleCard.paymentMethodID === paymentMethodID
    )?.[0];

    // check if the card to be deleted exists in the business document
    if (!simpleCardToBeDefault) {
      const error: PerkifyError = {
        status: 400,
        reason: "Couldn't find the card to set as default",
        reasonDetail:
          "Couldn't find the card to set as default with the specified payment method ID",
      };
      next(error);
    }

    // set all cards to non default
    Object.keys(cardPaymentMethods).forEach((cardFingerprint) => {
      cardPaymentMethods[cardFingerprint].default = false;
    });

    // set the card to be default to default true
    cardPaymentMethods[simpleCardToBeDefault.fingerprint].default = true;

    // then set that payment method as the default
    // for the stripe customer
    await stripe.customers.update(businessData.businessID, {
      invoice_settings: {
        default_payment_method: paymentMethodID,
      },
    });

    // update the business document
    const docRef = db.collection('businesses').doc(businessData.businessID);
    await docRef.update(`cardPaymentMethods`, cardPaymentMethods);

    res.status(200).send();
  }
);
