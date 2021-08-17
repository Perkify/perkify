// import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import { functions } from '../models';
import { errorHandler } from '../utils';
import {
  createPerkGroup,
  createPerkGroupValidators,
  createPortalLink,
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

// register an admin with a business
app.post(
  '/admin',
  [...registerAdminAndBusinessValidators],
  registerAdminAndBusiness
);

// regiser a user
app.post('/user', registerUserValidators, registerUser);

// create a portal link for a user
app.post('/portalLink', createPerkGroupValidators, createPortalLink);

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

app.use(errorHandler);

export const restApi = functions.https.onRequest(app);
