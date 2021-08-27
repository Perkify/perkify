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
      businessID: businessRef.id,
    };
    // create admin document to link user to business
    await db.collection('admins').doc(newUser.uid).set(adminData);

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
      admins: [newUser.uid],
      perkGroups: {},
      cardPaymentMethods: {},
      stripeId: customer.id,
      stripeLink: `https://dashboard.stripe.com${
        customer.livemode ? '' : '/test'
      }/customers/${customer.id}`,
    };

    // set the business document
    businessRef.set(businessData);

    const confirmationLink = await admin
      .auth()
      .generateSignInWithEmailLink(email, {
        url:
          functions.config()['stripe-firebase'].environment == 'production'
            ? 'https://admin.getperkify.com/login'
            : functions.config()['stripe-firebase'].environment == 'staging'
            ? 'https://admin.dev.getperkify.com/login'
            : 'http://localhost:3000/login',
      });

    // if in development mode, print the confirmation link
    if (functions.config()['stripe-firebase'].environment == 'development') {
      logger.log(`Generated confirmation link for ${email}`, confirmationLink);
    }

    // send email
    await db.collection('mail').add({
      to: email,
      template: {
        name: 'adminEmailConfiramtion',
        data: {
          name: `${firstName} ${lastName}`,
          email,
          confirmationLink,
        },
      },
    });

    res.status(200).end();
  } catch (err) {
    next(err);
  }
};
