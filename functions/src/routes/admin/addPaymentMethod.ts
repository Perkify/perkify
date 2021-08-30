import { NextFunction, Response } from 'express';
import { body } from 'express-validator';
import { logger } from 'firebase-functions';
import { db, stripe } from '../../services';
import { AdminPerkifyRequest, adminPerkifyRequestTransform } from '../../types';
import {
  checkValidationResult,
  validateAdminDoc,
  validateBusinessDoc,
  validateFirebaseIdToken,
} from '../../utils';

// const deletePaymentMethod = async (paymentMethod: Stripe.PaymentMethod) => {
//   if (paymentMethod.card) {
//     // only support card payment methods for now

//     const businessesSnapshot = await db.collection('businesses').get();

//     // search all businesses for the card fingerprint
//     businessesSnapshot.forEach((businessDoc) => {
//       const business = businessDoc.data() as Business;

//       const card = paymentMethod.card;

//       if (
//         card?.fingerprint &&
//         card?.fingerprint in business.cardPaymentMethods
//       ) {
//         const docRef = db.collection('businesses').doc(businessDoc.id);

//         // delete the payment method from the business doc
//         docRef.update({
//           [`cardPaymentMethods.${card?.fingerprint}`]:
//             admin.firestore.FieldValue.delete(),
//         });
//       }
//     });
//   } else {
//     logger.error('Payment method deleted that is not a card');
//   }
// };

export const addPaymentMethodValidators = [
  validateFirebaseIdToken,
  validateAdminDoc,
  validateBusinessDoc,
  body('paymentMethodID').notEmpty(),
  checkValidationResult,
];

export const addPaymentMethod = adminPerkifyRequestTransform(
  async (req: AdminPerkifyRequest, res: Response, next: NextFunction) => {
    const businessData = req.businessData;

    const { paymentMethodID, useAsDefaultCreditCard } =
      req.body as AddPaymentMethodPayload;

    // get the full payment method
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodID);

    const card = paymentMethod.card;
    if (card && card.fingerprint && card.country) {
      // only support card payment methods for now

      // update the default payment method of the stripe customer
      await stripe.customers.update(businessData.businessID, {
        invoice_settings: { default_payment_method: paymentMethodID },
      });

      // get the business payment methods
      const cardPaymentMethods = req.businessData.cardPaymentMethods;

      if (useAsDefaultCreditCard) {
        // set all of them to false if we are adding a default card
        Object.keys(cardPaymentMethods).forEach((cardFingerprint) => {
          cardPaymentMethods[cardFingerprint].default = false;
        });
      }

      // add the new card to the cardPaymentMethods
      cardPaymentMethods[card.fingerprint] = {
        brand: card.brand,
        country: card.country,
        expMonth: card.exp_month,
        expYear: card.exp_year,
        funding: card.funding,
        last4: card.last4,
        default: useAsDefaultCreditCard,
        fingerprint: card.fingerprint,
      };

      // update the business document
      const docRef = db
        .collection('businesses')
        .doc(paymentMethod.customer as string);
      await docRef.update(`cardPaymentMethods`, cardPaymentMethods);
    } else {
      logger.error('Payment method added that is not a card');
    }

    res.status(200).send();
  }
);
