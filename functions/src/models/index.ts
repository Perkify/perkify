import * as admin from 'firebase-admin';
import { privateStripeKey } from 'configs';
import * as functions from 'firebase-functions';
import Stripe from 'stripe';

admin.initializeApp();
// axios.defaults.baseURL = rapydBaseURL;
const db = admin.firestore();

const stripe = new Stripe(privateStripeKey, {
  apiVersion: '2020-08-27',
});

export default admin;

export { db, functions, stripe };
