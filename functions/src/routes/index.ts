// import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import { functions } from '../services';
import { errorHandlerMiddleware } from '../utils';
import {
  addPaymentMethod,
  addPaymentMethodValidators,
  createPerkGroup,
  createPerkGroupValidators,
  createPortalLink,
  createPortalLinkValidators,
  createSetupIntent,
  createSetupIntentValidators,
  deletePerkGroup,
  deletePerkGroupValidators,
  registerAdminAndBusiness,
  registerAdminAndBusinessValidators,
  removePaymentMethod,
  removePaymentMethodValidators,
  sendEmailVerificationLink,
  sendEmailVerificationLinkValidators,
  sendPasswordResetLink,
  sendPasswordResetLinkValidators,
  setDefaultPaymentMethod,
  setDefaultPaymentMethodValidators,
  updatePerkGroup,
  updatePerkGroupValidators,
} from './admin';
import {
  createEmployees,
  createEmployeesValidators,
  deleteEmployees,
  deleteEmployeesValidators,
  registerUser,
  registerUserValidators,
  sendSignInLink,
  sendSignInLinkValidators,
} from './user';

const app = express();

app.use(
  cors({
    origin: [
      /^http?:\/\/(.+\.)?localhost(:\d+)?$/,
      /^https?:\/\/(.+\.)?localhost(:\d+)?$/,
      /^https?:\/\/(.+\.)?getperkify\.com(:\d+)?$/,
      /^https?:\/\/(.+\.)?perkify-5790b.*\.web\.app$/,
    ],
    credentials: true,
  })
);

// --------------- Express Routes --------------- //

// create a setup intent for a business
// the businessID url param is not used because it is extracted
// from the admin making the request
// but in the future if we want to support one admin for multiple businesses
// we will need to specify which business we are referring to
app.post(
  '/business/:businessID/setupIntent',
  createSetupIntentValidators,
  createSetupIntent
);

app.post(
  '/business/:businessID/paymentMethod',
  addPaymentMethodValidators,
  addPaymentMethod
);

app.put(
  '/business/:businessID/defaultPaymentMethod/:paymentMethodID',
  setDefaultPaymentMethodValidators,
  setDefaultPaymentMethod
);

app.delete(
  '/business/:businessID/paymentMethod/:paymentMethodID',
  removePaymentMethodValidators,
  removePaymentMethod
);

// register an admin with a business
app.post(
  '/admin',
  [...registerAdminAndBusinessValidators],
  registerAdminAndBusiness
);

// create an employee
app.post('/employee', createEmployeesValidators, createEmployees);
// delete employees
app.post('/employee/delete', deleteEmployeesValidators, deleteEmployees);

// regiser an employee with a card
app.post('/employee/register', registerUserValidators, registerUser);

// send a sign-in link to user
app.post(
  '/user/:userEmail/signInLink',
  sendSignInLinkValidators,
  sendSignInLink
);

// create a portal link for a user
// app.post('/portalLink', createPerkGroupValidators, createPortalLink);
app.post('/portalLink', createPortalLinkValidators, createPortalLink);

// resend email confirmation link to admin
app.post(
  '/admin/:adminEmail/emailVerificationLink',
  sendEmailVerificationLinkValidators,
  sendEmailVerificationLink
);

// send a password-reset link to admin
app.post(
  '/admin/:adminEmail/passwordResetLink',
  sendPasswordResetLinkValidators,
  sendPasswordResetLink
);

// perk group crud
app.post('/perkGroup', createPerkGroupValidators, createPerkGroup);
app.put('/perkGroup/:perkGroupID', updatePerkGroupValidators, updatePerkGroup);
app.delete(
  '/perkGroup/:perkGroupID',
  deletePerkGroupValidators,
  deletePerkGroup
);

app.use(errorHandlerMiddleware);

export const restApi = functions.https.onRequest(app);
