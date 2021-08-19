import * as admin from "firebase-admin";
import Stripe from "stripe";
import { privateStripeKey } from "../configs";

admin.initializeApp();
// axios.defaults.baseURL = rapydBaseURL;
const db = admin.firestore();
const auth = admin.auth();

const stripe = new Stripe(privateStripeKey, {
  apiVersion: "2020-08-27",
});

export default admin;

export { db, auth, stripe };
