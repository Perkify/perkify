// import axios from 'axios';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import { auth, functions } from './models';
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

stripeWebhooksApp.use(express.json());
stripeWebhooksApp.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }),
  stripeWebhooks
);
exports.stripe = functions.https.onRequest(stripeWebhooksApp);

exports.deleteUsers = functions.https.onRequest(
  async (req, res): Promise<any> => {
    const allUsers = await auth.listUsers();
    const allUsersUID = allUsers.users.map((user) => user.uid);
    return auth.deleteUsers(allUsersUID).then(() => res.send('deleted'));
  }
);
