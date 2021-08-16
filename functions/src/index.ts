// import axios from 'axios';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import { functions } from './models';
import {
  createGroup,
  createGroupValidators,
  deletePerkGroup,
  deletePerkGroupValidators,
  registerAdminAndBusiness,
  registerAdminAndBusinessValidators,
  registerUser,
  registerUserValidators,
  stripeWebhooks,
  updatePerkGroup,
  updatePerkGroupValidators,
} from './routes';
import { validateFirebaseIdToken } from './utils';
import { syncUsersWithBusinessDocumentPerkGroup } from './utils/crudHelpers';
export * from './firestore-stripe-subscriptions';

// express endpoint

const app = express();
const stripeWebhooksApp = express();

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

exports.user = functions.https.onRequest(app);

stripeWebhooksApp.use(express.json());
stripeWebhooksApp.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }),
  stripeWebhooks
);
exports.stripe = functions.https.onRequest(stripeWebhooksApp);

exports.syncUsersWithBusinessDocumentPerkGroup = functions.https.onRequest(
  syncUsersWithBusinessDocumentPerkGroup
);
