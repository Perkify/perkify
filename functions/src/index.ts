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
  getStripePaymentMethods,
  registerAdminAndBusiness,
  registerAdminAndBusinessValidators,
  registerUser,
  registerUserValidators,
  stripeWebhooks,
  updatePerkGroup,
  updatePerkGroupValidators,
  listBalanceTransactions,
} from './routes';
import { validateFirebaseIdToken } from './utils';

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

// TODO move this to part of firestore with stripe webhook
app.get('/auth/stripePaymentMethods', getStripePaymentMethods);
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
stripeWebhooksApp.get('/listBalanceTransactions', listBalanceTransactions);
exports.stripe = functions.https.onRequest(stripeWebhooksApp);
