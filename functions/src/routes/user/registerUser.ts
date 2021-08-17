import { body, validationResult } from 'express-validator';
import { db, stripe } from '../../models';

export const registerUserValidators = [
  body('firstName').not().isEmpty(),
  body('lastName').not().isEmpty(),
];
export const registerUser = async (req, res, next) => {
  const { firstName, lastName, ...rest } = req.body;

  try {
    // check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = {
        status: 400,
        reason: 'Bad Request',
        reasonDetail: JSON.stringify(errors.array()),
      };
      return next(error);
    }

    if (Object.keys(rest).length > 0) {
      const error = {
        status: 400,
        reason: 'extraneous parameters',
        reasonDetail: Object.keys(rest).join(','),
      };
      return next(error);
    }

    const email = req.user.email;

    // TODO: get field directly
    const userData = (await db.collection('users').doc(email).get()).data();

    if (!userData) {
      const error = {
        status: 500,
        reason: 'Missing user document',
        reasonDetail: `User documents missing from firestore`,
      };
      return next(error);
    }

    const businessID = userData.businessID;

    const businessData = (
      await db.collection('businesses').doc(businessID).get()
    ).data();

    if (!businessData) {
      const error = {
        status: 500,
        reason: 'Missing business document',
        reasonDetail: `Business documents missing from firestore`,
      };
      return next(error);
    }

    const billingAddress = businessData.billingAddress;

    if (billingAddress && billingAddress?.line2 == '') {
      delete billingAddress['line2'];
    }

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

    await db
      .collection('users')
      .doc(email)
      .update({
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
      });

    res.status(200).end();
  } catch (err) {
    next(err);
  }
};
