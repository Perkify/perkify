// import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import { functions } from '../models';
import { errorHandler, validateFirebaseIdToken } from '../utils';
import {
  createGroup,
  createGroupValidators,
  createPortalLink,
  createPortalLinkValidators,
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
app.post('/user', [...registerUserValidators], registerUser);

// create a portal link for a user
app.post(
  '/portalLink',
  [validateFirebaseIdToken, ...createPortalLinkValidators],
  createPortalLink
);

// perk group crud
app.post(
  '/perkGroup',
  [validateFirebaseIdToken, ...createGroupValidators],
  createGroup
);
app.put(
  '/perkGroup/:perkGroupName',
  [validateFirebaseIdToken, ...updatePerkGroupValidators],
  updatePerkGroup
);
app.delete(
  '/perkGroup/:perkGroupName',
  [validateFirebaseIdToken, ...deletePerkGroupValidators],
  deletePerkGroup
);

app.use(errorHandler);

export const restApi = functions.https.onRequest(app);
