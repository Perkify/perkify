// import axios from 'axios';
import * as cors from 'cors';
import * as express from 'express';
import { validateFirebaseIdToken } from './utils';
import { functions, auth } from './models';
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
  updatePerkGroup,
  updatePerkGroupValidators,
} from './routes';

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

exports.deleteUsers = functions.https.onRequest(
  async (req, res): Promise<any> => {
    const allUsers = await auth.listUsers();
    const allUsersUID = allUsers.users.map((user) => user.uid);
    return auth.deleteUsers(allUsersUID).then(() => res.send('deleted'));
  }
);
