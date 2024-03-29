import { NextFunction, Response } from 'express';
import { param } from 'express-validator';
import { db, stripe } from '../../services';
import {
  adminPerkifyRequestTransform,
  checkValidationResult,
  validateAdminDoc,
  validateBusinessDoc,
  validateFirebaseIdToken,
} from '../../utils';

export const removePaymentMethodValidators = [
  validateFirebaseIdToken,
  validateAdminDoc,
  validateBusinessDoc,
  param('paymentMethodID').notEmpty(),
  checkValidationResult,
];

export const removePaymentMethod = adminPerkifyRequestTransform(
  async (req: AdminPerkifyRequest, res: Response, next: NextFunction) => {
    const paymentMethodID = req.params.paymentMethodID;
    const businessData = req.businessData;
    // get the business payment methods
    const cardPaymentMethods = req.businessData.cardPaymentMethods;

    // check if the business has a backup card payment method
    if (
      Object.keys(cardPaymentMethods).length == 1 &&
      Object.keys(businessData.perkGroups).length != 0
    ) {
      const error: PerkifyError = {
        status: 400,
        reason: 'Not enough payment methods',
        reasonDetail:
          "Can't delete your last payment method when you have an active subscription. Please add another payment method first.",
      };
      return next(error);
    }

    const simpleCardToBeDeleted = Object.values(cardPaymentMethods).filter(
      (simpleCard) => simpleCard.paymentMethodID === paymentMethodID
    )?.[0];

    // check if the card to be deleted exists in the business document
    if (!simpleCardToBeDeleted) {
      const error: PerkifyError = {
        status: 400,
        reason: "Couldn't find the card to delete",
        reasonDetail:
          "Couldn't find the card to delete with the specified payment method ID",
      };
      return next(error);
    }

    // remove the card to be deleted from the payment methods
    delete cardPaymentMethods[simpleCardToBeDeleted.fingerprint];

    // check if we were removing the default card and we will have a remaining payment method to set as default
    if (
      Object.keys(cardPaymentMethods).length != 0 &&
      simpleCardToBeDeleted.default
    ) {
      // if so, set another card as the default
      const newDefaultCardKey = Object.keys(cardPaymentMethods)[0];
      cardPaymentMethods[newDefaultCardKey].default = true;

      // then set that payment method as the default
      // for the stripe customer
      await stripe.customers.update(businessData.businessID, {
        invoice_settings: {
          default_payment_method:
            cardPaymentMethods[newDefaultCardKey].paymentMethodID,
        },
      });
    }

    // remove the payment method from the stripe customer
    await stripe.paymentMethods.detach(paymentMethodID);

    // update the business document
    const docRef = db.collection('businesses').doc(businessData.businessID);
    await docRef.update(`cardPaymentMethods`, cardPaymentMethods);

    res.status(200).send();
  }
);
