import * as validator from 'validator';
import { allPerks } from '../../shared';
import { db } from '../models';
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
  } else {
    return Promise.reject(new Error('send array of perks'));
  }
  return Promise.resolve();
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
      ...Object.values((businessDoc.data() as Business).groups).map(
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
