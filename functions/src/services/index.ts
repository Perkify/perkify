import { CloudTasksClient } from '@google-cloud/tasks';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import Stripe from 'stripe';
import { privateStripeKey } from '../configs';

// Get the project ID from the FIREBASE_CONFIG env var
const project = JSON.parse(process.env.FIREBASE_CONFIG!).projectId;
const firebaseProjectLocation = 'us-central1';
const queue = 'firestore-stripe-delay';
const firebaseFunctionsUrl = `https://${firebaseProjectLocation}-${project}.cloudfunctions.net`;

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

const stripe = new Stripe(privateStripeKey, {
  apiVersion: '2020-08-27',
});

const tasksClient = new CloudTasksClient();
const queuePath: string = tasksClient.queuePath(
  project,
  firebaseProjectLocation,
  queue
);

const environment = functions.config()['stripe-firebase'].environment;

export default admin;

export {
  db,
  auth,
  functions,
  stripe,
  tasksClient,
  queuePath,
  project,
  firebaseProjectLocation,
  firebaseFunctionsUrl,
  environment,
};
