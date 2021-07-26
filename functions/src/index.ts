// import axios from 'axios';
import * as cors from 'cors';
import * as express from 'express';
import { allPerks } from '../shared';
import { body, validationResult } from 'express-validator';
import { handleError, validateFirebaseIdToken } from 'middleware';
import {
  emailNormalizationOptions,
  validateUserEmail,
  deleteUserHelper,
} from 'utils';
import {
  registerAdminAndBusiness,
  registerAdminAndBusinessValidators,
  createGroup,
  createGroupValidators,
  updatePerkGroup,
  updatePerkGroupValidators,
  deletePerkGroup,
  deletePerkGroupValidators,
  registerUser,
  registerUserValidators,
  getStripePaymentMethods,
} from 'routes';

import admin, { db, functions } from 'models';

// express endpoint

const app = express();

app.use(
  cors({
    origin: [
      /^http?:\/\/(.+\.)?localhost(:\d+)?$/,
      /^https?:\/\/(.+\.)?localhost(:\d+)?$/,
      /^https?:\/\/(.+\.)?getperkify\.com(:\d+)?$/,
    ],
    credentials: true,
  })
);

// --------------- Express Routes --------------- //

app.post(
  '/registerAdminAndBusiness',
  registerAdminAndBusinessValidators,
  registerAdminAndBusiness
);

app.post('/registerUser', registerUserValidators, registerUser);

app.use('/auth', validateFirebaseIdToken);
app.post('/auth/createGroup', createGroupValidators, createGroup);
app.put('/auth/updatePerkGroup', updatePerkGroupValidators, updatePerkGroup);
app.post('/auth/deletePerkGroup', deletePerkGroupValidators, deletePerkGroup);

// TODO move this to part of firestore with stripe webhook
app.get('/auth/stripePaymentMethods', getStripePaymentMethods);

exports.user = functions.https.onRequest(app);
