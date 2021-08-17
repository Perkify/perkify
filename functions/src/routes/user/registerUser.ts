import { NextFunction, Response } from 'express';
import { body } from 'express-validator';
import { db, stripe } from '../../services';
import { UserPerkifyRequest, userPerkifyRequestTransform } from '../../types';
import {
  checkValidationResult,
  validateBusinessDoc,
  validateFirebaseIdToken,
  validateUserDoc,
} from '../../utils';

export interface RegisterUserPayload {
  firstName: string;
  lastName: string;
}

export const registerUserValidators = [
  validateFirebaseIdToken,
  validateUserDoc,
  validateBusinessDoc,
  body('firstName').not().isEmpty(),
  body('lastName').not().isEmpty(),
  checkValidationResult,
];

// when does registerUser get called?
// what is the user creation flow?
export const registerUser = userPerkifyRequestTransform(
  async (req: UserPerkifyRequest, res: Response, next: NextFunction) => {
    const { firstName, lastName } = req.body as RegisterUserPayload;
    const email = req.user.email;
    const businessData = req.businessData;

    const billingAddress = businessData.billingAddress;

    if (billingAddress && billingAddress?.line2 == '') {
      delete billingAddress['line2'];
    }

    try {
      const cardholder = await stripe.issuing.cardholders.create({
        type: 'individual',
        name: `${firstName} ${lastName}`,
        email: email,
        billing: {
          address: billingAddress,
        },
        status: 'active',
      });
      const cardholderID = cardholder.id;

      const card = await stripe.issuing.cards.create({
        cardholder: cardholderID,
        currency: 'usd',
        type: 'virtual',
        status: 'active',
      });

      const cardDetails = await stripe.issuing.cards.retrieve(card.id, {
        expand: ['number', 'cvc'],
      });

      // we combine prevUserData with new data
      // in order to be sure we are satisfying the User type
      const prevUserData = (
        await db.collection('users').doc(email).get()
      ).data() as SimpleUser;
      await db
        .collection('users')
        .doc(email)
        .set({
          ...prevUserData,
          firstName: firstName,
          lastName: lastName,
          card: {
            id: card.id,
            cardholderID: cardholderID,
            number: cardDetails.number,
            cvc: cardDetails.cvc,
            exp: {
              month: cardDetails.exp_month,
              year: cardDetails.exp_year,
            },
            // billing address saved with card for both ease of access and so if business
            // billing address changes card still works without having to reissue cards
            // TODO: remove this make billing address changes reissue cards?
            billing: {
              address: billingAddress,
            },
          },
        } as User);

      res.status(200).end();
    } catch (err) {
      next(err);
    }
  }
);
