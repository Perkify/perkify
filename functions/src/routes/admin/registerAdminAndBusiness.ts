import { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import { logger } from 'firebase-functions';
import admin, { db, functions, stripe } from '../../services';
import { checkValidationResult, emailNormalizationOptions } from '../../utils';

export const registerAdminAndBusinessValidators = [
  body('firstName').not().isEmpty(),
  body('lastName').not().isEmpty(),
  body('email').isEmail().normalizeEmail(emailNormalizationOptions),
  body('password').not().isEmpty(),
  body('businessName').not().isEmpty(),
  body('line1').not().isEmpty(),
  body('city').not().isEmpty(),
  body('state').isLength({ min: 2, max: 2 }),
  body('postalCode').not().isEmpty(),
  checkValidationResult,
];

export const registerAdminAndBusiness = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    firstName,
    lastName,
    email,
    password,
    businessName,
    line1,
    line2,
    city,
    state,
    postalCode,
  } = req.body as RegisterAdminAndBusinessPayload;

  try {
    // create firebase user
    const newUser = await admin.auth().createUser({
      email,
      emailVerified: false,
      password,
      displayName: firstName + ' ' + lastName,
      disabled: false,
    });

    // create the stripe customer
    const customer = await stripe.customers.create({ email });

    // create business entity document
    const businessRef = db.collection('businesses').doc(customer.id);

    const adminData: Admin = {
      email,
      firstName,
      lastName,
      businessID: businessRef.id, // possibly remove this?
      adminID: newUser.uid,
      isOwner: true,
    };
    // create admin document to link user to business
    await db
      .collection('businesses')
      .doc(customer.id)
      .collection('admins')
      .doc(newUser.uid)
      .set(adminData);

    const businessData: Business = {
      businessID: businessRef.id,
      name: businessName,
      billingAddress: {
        city,
        country: 'US',
        line1,
        line2,
        postal_code: postalCode,
        state,
      },
      perkGroups: {},
      cardPaymentMethods: {},
      stripeId: customer.id,
      stripeLink: `https://dashboard.stripe.com${
        customer.livemode ? '' : '/test'
      }/customers/${customer.id}`,
    };

    // set the business document
    businessRef.set(businessData);

    const verificationLink = await admin
      .auth()
      .generateEmailVerificationLink(email, {
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
        `Generated email verification link for ${email}`,
        verificationLink
      );
    }

    // send email
    await db.collection('mail').add({
      to: email,
      template: {
        name: 'adminEmailConfirmation',
        data: {
          name: `${firstName} ${lastName}`,
          email,
          verificationLink,
        },
      },
    });

    res.status(200).end();
  } catch (err) {
    next(err);
  }
};
