import { body, validationResult } from 'express-validator';
import {
  emailNormalizationOptions,
  validateUserEmail,
  validateEmails,
  sanitizeEmails,
  validatePerks,
} from 'utils';
import admin, { db, stripe } from 'models';
import { handleError } from 'middleware';
import { createUserHelper, deleteUserHelper } from 'utils';

export const registerUserValidators = [
  body('email')
    .isEmail()
    .normalizeEmail(emailNormalizationOptions)
    .custom(validateUserEmail),
  body('firstName').not().isEmpty(),
  body('lastName').not().isEmpty(),
  body('dob').isDate(),
];
export const registerUser = async (req, res) => {
  const { firstName, lastName, ...rest } = req.body;

  try {
    // check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = {
        status: 400,
        reason: 'Bad Request',
        reason_detail: JSON.stringify(errors.array()),
      };
      throw error;
    }

    if (Object.keys(rest).length > 0) {
      const error = {
        status: 400,
        reason: 'extraneous parameters',
        reason_detail: Object.keys(rest).join(','),
      };
      throw error;
    }

    const email = req.user.email;

    // TODO: get field directly
    const userSnap = await db.collection('users').doc(email).get();
    const businessID = userSnap.data().businessID;
    const businessSnap = await db
      .collection('businesses')
      .doc(businessID)
      .get();
    const billingAddress = businessSnap.data().billingAddress;
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
    handleError(err, res);
  }
};
