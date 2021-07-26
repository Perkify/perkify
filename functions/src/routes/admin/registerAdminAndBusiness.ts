import { body, validationResult } from 'express-validator';
import admin, { db } from '../../models';
import { emailNormalizationOptions, handleError } from '../../utils';

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
];

export const registerAdminAndBusiness = async (req, res) => {
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
  } = req.body;

  try {
    // verify that no extra parameters were sent
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = {
        status: 400,
        reason: 'Bad Request',
        reason_detail: JSON.stringify(errors.array()),
      };
      throw error;
    }

    // if (Object.keys(rest).length > 0) {
    //   const error = {
    //     status: 400,
    //     reason: 'extraneous parameters',
    //     reason_detail: Object.keys(rest).join(','),
    //   };
    //   throw error;
    // }

    // create firebase user
    const newUser = await admin.auth().createUser({
      email,
      emailVerified: false,
      password,
      displayName: firstName + ' ' + lastName,
      disabled: false,
    });

    // create business entity
    const businessRef = await db.collection('businesses').add({
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
      groups: {},
    });

    // create admin document to link user to business
    await db.collection('admins').doc(newUser.uid).set({
      email,
      firstName,
      lastName,
      companyID: businessRef.id,
    });

    res.status(200).end();
  } catch (err) {
    // TODO: if globalWalletID is set then use rapid api to delete the wallet
    handleError(err, res);
  }
};
