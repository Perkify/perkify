import { NextFunction, Response } from 'express';
import { Request as ValidatorRequest } from 'express-validator/src/base';
import { logger } from 'firebase-functions';
import validator from 'validator';
import { allPerks } from '../../shared';
import { auth, db } from '../services';
import {
  PartialAdminPerkifyRequest,
  PartialBusinessPerkifyRequest,
  PartialUserPerkifyRequest,
} from '../types';
import { generateEmailsPatch } from './perkGroupHelpers';
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

export const validateUserEmail = async (email: string) => {
  const userRef = await db.collection('users').doc(email).get();
  if (!userRef.exists) {
    return Promise.reject(new Error('You are not added by your employer'));
  } else {
    return Promise.resolve();
  }
};

export const validateEmails = async (emails: string[]) => {
  if (Array.isArray(emails) && emails.length > 0) {
    for (const email of emails) {
      if (!validator.isEmail(email)) {
        return Promise.reject(new Error(`email: ${email} is not email`));
      }
    }

    if (new Set(emails).size !== emails.length) {
      throw new Error('Trying to add duplicate emails');
    }
  } else {
    return Promise.reject(new Error('send array of emails'));
  }
  return Promise.resolve();
};

export const sanitizeEmails = (emails: string[]) => {
  return emails.map((email) =>
    validator.normalizeEmail(email, emailNormalizationOptions)
  );
};

export const validatePerkNames = async (perkNames: string[]) => {
  if (Array.isArray(perkNames) && perkNames.length > 0) {
    for (const perk of perkNames) {
      if (!allPerks.some((truePerk) => truePerk.Name === perk)) {
        return Promise.reject(new Error(`perk: ${perk} is not supported`));
      }
    }

    if (new Set(perkNames).size !== perkNames.length) {
      throw new Error('Trying to add duplicate perkNames');
    }
  } else {
    return Promise.reject(new Error('send array of perkNames'));
  }
  return Promise.resolve();
};

export const validateNewPerkGroupName = async (
  perkGroupName: string,
  { req }: { req: ValidatorRequest }
) => {
  if (perkGroupName) {
    const businessData = req.businessData as Business;
    if (Object.keys(businessData.perkGroups).includes(perkGroupName)) {
      throw new Error(
        'Trying to create a perk group with a name that already exists'
      );
    }
  } else {
    throw new Error('Perk group name not specified');
  }
  return;
};

export const validateExistingPerkGroupName = async (
  perkGroupName: string,
  { req }: { req: ValidatorRequest }
) => {
  if (perkGroupName) {
    const businessData = req.businessData;
    if (!Object.keys(businessData.perkGroups).includes(perkGroupName)) {
      throw new Error(
        "Trying to update a perk group with a name that doesn't exist"
      );
    }
  } else {
    throw new Error('Perk group name not specified');
  }
  return;
};

export const checkIfAnyEmailsAreClaimed = async (emails: string[]) => {
  // check if any of the emails exist in any business
  const businessesSnapshot = await db.collection('businesses').get();

  // generate list of all employee emails
  const allEmployeesAcrossBusinesses: string[] = [];
  businessesSnapshot.forEach((businessDoc) => {
    Object.values((businessDoc.data() as Business).perkGroups)
      .map((perkGroup) => perkGroup.userEmails)
      .forEach((perkGroupEmails) => {
        allEmployeesAcrossBusinesses.push(...perkGroupEmails);
      });
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

export const checkIfAnyEmailsToAddAreClaimed = async (
  emails: string[],
  { req }: { req: ValidatorRequest }
) => {
  // current state of perk group
  const currentPerkGroup = (req.businessData as Business).perkGroups[
    req.params?.perkGroupName
  ] as PerkGroup;

  // get the emails to be created
  const { emailsToCreate } = generateEmailsPatch(
    currentPerkGroup.userEmails,
    emails
  );

  // check if any of the emails to be created are claimed
  await checkIfAnyEmailsAreClaimed(emailsToCreate);
};

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
export const validateFirebaseIdToken = async (
  req: PartialAdminPerkifyRequest,
  res: Response,
  next: NextFunction
) => {
  if (
    !req.headers.authorization ||
    (!req.headers.authorization.startsWith('Bearer ') &&
      !(req.cookies && req.cookies.__session))
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
    const { email, uid } = decodedIdToken;
    req.user = { email: email as string, uid };
    return next();
  } catch (error) {
    logger.error('Error while verifying Firebase ID token', error);
    const err = {
      status: 403,
      reason: 'Unauthorized',
    };
    return next(err);
  }
};

export const validateAdminDoc = async (
  req: PartialAdminPerkifyRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    const error = {
      status: 500,
      reason: 'user not available in middleware',
      reasonDetail: 'user not available in middleware',
    };
    return next(error);
  }
  const adminData = (
    await db.collection('admins').doc(req.user.uid).get()
  ).data() as Admin;

  if (adminData == null) {
    const error = {
      status: 500,
      reason: 'Missing admin document',
      reasonDetail: `Missing admin document in firestore`,
    };
    return next(error);
  }

  req.adminData = adminData;
  req.businessID = adminData.businessID;
  return next();
};

export const validateUserDoc = async (
  req: PartialUserPerkifyRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    const error = {
      status: 500,
      reason: 'user not available in middleware',
      reasonDetail: 'user not available in middleware',
    };
    return next(error);
  }

  const userData = (
    await db.collection('users').doc(req.user.email).get()
  ).data() as User;

  if (userData == null) {
    const error = {
      status: 500,
      reason: 'Missing user document',
      reasonDetail: `Missing user document in firestore`,
    };
    return next(error);
  }

  req.userData = userData;
  req.businessID = userData.businessID;
  return next();
};

export const validateBusinessDoc = async (
  req: PartialBusinessPerkifyRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.businessID) {
    const error = {
      status: 500,
      reason: 'businessID not available in middleware',
      reasonDetail: 'businessID not available in middleware',
    };
    return next(error);
  }

  const businessData = (
    await db.collection('businesses').doc(req.businessID).get()
  ).data() as Business;

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
