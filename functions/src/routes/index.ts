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
  updatePerkGroup,
  updatePerkGroupValidators,
} from './admin';
import { registerUser, registerUserValidators } from './user';

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

// register an admin with a business
app.post(
  '/admin',
  [...registerAdminAndBusinessValidators],
  registerAdminAndBusiness
);

// regiser a user
app.post('/user', registerUserValidators, registerUser);

// create a portal link for a user
// app.post('/portalLink', createPerkGroupValidators, createPortalLink);
app.post('/portalLink', createPortalLinkValidators, createPortalLink);

// perk group crud
app.post(
  '/perkGroup/:perkGroupName',
  createPerkGroupValidators,
  createPerkGroup
);
app.put(
  '/perkGroup/:perkGroupName',
  updatePerkGroupValidators,
  updatePerkGroup
);
app.delete(
  '/perkGroup/:perkGroupName',
  deletePerkGroupValidators,
  deletePerkGroup
);

app.use(errorHandlerMiddleware);

export const restApi = functions.https.onRequest(app);
