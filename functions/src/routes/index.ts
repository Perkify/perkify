// import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import { functions } from '../models';
import { validateFirebaseIdToken } from '../utils';
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

app.post(
  '/registerAdminAndBusiness',
  registerAdminAndBusinessValidators,
  registerAdminAndBusiness
);

app.use('/auth', validateFirebaseIdToken);
app.post('/auth/registerUser', registerUserValidators, registerUser);
app.post(
  '/auth/createPortalLink',
  createPortalLinkValidators,
  createPortalLink
);
app.post('/auth/createGroup', createGroupValidators, createGroup);
app.put('/auth/updatePerkGroup', updatePerkGroupValidators, updatePerkGroup);
app.post('/auth/deletePerkGroup', deletePerkGroupValidators, deletePerkGroup);
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (!(err.status && err.reason && err.reasonDetail)) {
    return next(err);
  }

  const { status, reason, reasonDetail } = err;

  res.status(status).send({ reason, reasonDetail }).end();
});

export const restApi = functions.https.onRequest(app);
