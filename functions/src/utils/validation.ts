import * as validator from 'validator';
import { allPerks } from '../../shared';
import { auth, db } from '../models';
// * Validation Helpers * //

// gmail treats emails with and without dots as the same.
// we don't want to take this into account
export const emailNormalizationOptions = {
  gmail_remove_dots: false,
  gmail_remove_subaddress: false,
  gmail_convert_googlemaildotcom: false,
  outlookdotcom_remove_subaddressf: false,
  yahoo_remove_subaddress: false,
  icloud_remove_subaddress: false,
};

export const validateUserEmail = async (email) => {
  const userRef = await db.collection('users').doc(email).get();
  if (!userRef.exists) {
    return Promise.reject(new Error('You are not added by your employer'));
  } else {
    return Promise.resolve();
  }
};

export const validateEmails = async (emails) => {
  if (Array.isArray(emails) && emails.length > 0) {
    for (const email of emails) {
      if (!validator.isEmail(email)) {
        return Promise.reject(new Error(`email: ${email} is not email`));
      }
    }
  } else {
    return Promise.reject(new Error('send array of emails'));
  }
  return Promise.resolve();
};

export const sanitizeEmails = (emails) => {
  return emails.map((email) =>
    validator.normalizeEmail(email, emailNormalizationOptions)
  );
};

export const validatePerks = async (perks) => {
  if (Array.isArray(perks) && perks.length > 0) {
    for (const perk of perks) {
      if (!allPerks.some((truePerk) => truePerk.Name === perk)) {
        return Promise.reject(new Error(`perk: ${perk} is not supported`));
      }
    }

    if (new Set(perks).size !== perks.length) {
      throw new Error('Trying to add duplicate perks');
    }
  } else {
    return Promise.reject(new Error('send array of perks'));
  }
  return Promise.resolve();
};

export const validateNewPerkGroupName = async (perkGroupName, { req }) => {
  if (perkGroupName) {
    const businessData = req.businessData as Business;
    if (Object.keys(businessData.perkGroups.perks).includes(perkGroupName)) {
      return new Error(
        'Trying to create a perk group with a name that already exists'
      );
    }
  } else {
    return new Error('Perk group name not specified');
  }
  return;
};

export const validateExistingPerkGroupName = async (perkGroupName, { req }) => {
  if (perkGroupName) {
    const businessData = req.businessData as Business;
    if (!Object.keys(businessData.perkGroups.perks).includes(perkGroupName)) {
      return new Error(
        "Trying to update a perk group with a name that doesn't exist"
      );
    }
  } else {
    return new Error('Perk group name not specified');
  }
  return;
};

export const checkIfAnyEmailsAreClaimed = async (emails) => {
  // check if user exists in another business
  // realizing that this check is being made 2 days later, can throw an error at that point...
  // that complicates things a bit
  // so one option is to read all business documents and check if any of them have the user

  // we need to read users from all of the business documents. Ideally we would use an index for this, not a long term solution
  // better solution is to support employees in multiple businesses, or use another collection for keeping track of "claimedEmails"
  const businessesSnapshot = await db.collection('businesses').get();

  const allEmployeesAcrossBusinesses: string[] = [];
  businessesSnapshot.forEach((businessDoc) => {
    allEmployeesAcrossBusinesses.concat(
      ...Object.values((businessDoc.data() as Business).perkGroups).map(
        (perkGroup) => perkGroup.employees
      )
    );
  });

  // check if any of the emails to create exist across all businesses
  const emailThatExistsInAnotherBusiness = emails.find((email) =>
    allEmployeesAcrossBusinesses.includes(email)
  );

  if (emailThatExistsInAnotherBusiness) {
    const error = {
      status: 400,
      reason: 'Bad Request',
      reasonDetail: `added email ${emailThatExistsInAnotherBusiness} that is already in another group`,
    };
    // throwing error so that it can get caught
    // by the caller which will then call next(error)
    throw error;
  }
};

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
export const validateFirebaseIdToken = async (req, res, next) => {
  if (
    (!req.headers.authorization ||
      !req.headers.authorization.startsWith('Bearer ')) &&
    !(req.cookies && req.cookies.__session)
  ) {
    const err = {
      status: 403,
      reason: 'Unauthorized',
      reasonDetail:
        'No Firebase ID token was passed as a Bearer token in the Authorization header or as cookie',
    };
    return next(err);
  }

  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else if (req.cookies) {
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    const err = {
      status: 403,
      reason: 'Unauthorized',
    };
    return next(err);
  }

  try {
    const decodedIdToken = await auth.verifyIdToken(idToken);
    req.user = decodedIdToken;
    return next();
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error);
    const err = {
      status: 403,
      reason: 'Unauthorized',
    };
    return next(err);
  }
};

export const validateAdminDoc = async (req, res, next) => {
  const adminData = (
    await db.collection('admins').doc(req.user.uid).get()
  ).data();

  if (adminData == null) {
    const error = {
      status: 500,
      reason: 'Missing admin document',
      reasonDetail: `Missing admin document in firestore`,
    };
    return next(error);
  }

  req.adminData = adminData;
  return next();
};

export const validateBusinessDoc = async (req, res, next) => {
  const businessData = (
    await db.collection('businesses').doc(req.adminData.businessID).get()
  ).data();

  if (businessData == null) {
    const error = {
      status: 500,
      reason: 'Missing business document',
      reasonDetail: `Missing business document in firestore`,
    };
    return next(error);
  }

  req.businessData = businessData;
  return next();
};
