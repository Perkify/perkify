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
