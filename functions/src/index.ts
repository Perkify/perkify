
import axios from "axios";
import * as cors from "cors";
import * as cryptoJS from "crypto-js";
import * as express from "express";
import { body, validationResult } from "express-validator";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as validator from "validator";
import { allPerks } from "../shared";
// import {user} from "firebase-functions/lib/providers/auth";
// import {Simulate} from "react-dom/test-utils";
// import contextMenu = Simulate.contextMenu;

import Stripe from "stripe";
const stripe = new Stripe(
  "sk_test_51JBSAtKuQQHSHZsmj9v16Z0VqTxLfK0O9KGzcDNq0meNrEZsY4sEN29QVZ213I5kyo0ssNwwTFmnC0LHgVurSnEn00Gn0CjfBu",
  {
    apiVersion: "2020-08-27",
  }

// rapyd credentials
const rapydSecretKey =
  '9ddd95bd2a2beb670c8297afec7fdea3a8cca2f64488d30e394aeebf5208d9c78e4f9c0a6ac0d5c8';
const rapydAccessKey = 'C8CF6F6A88C4B7A1DEC8';
// rapyd base uri
const rapydBaseURL = 'https://sandboxapi.rapyd.net';

admin.initializeApp();
axios.defaults.baseURL = rapydBaseURL;
const db = admin.firestore();

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

// --------------- Middleware/Helpers --------------- //

const handleError = (err, res) => {
  if (typeof err !== 'object' || typeof err.status !== 'number') {
    err = {
      status: 500,
      reason: 'INTERNAL_SERVER_ERROR',
      reason_detail: err ? err.toString() : undefined,
    };
  }

  console.error(err);
  res.status(err.status).json(err).end();
};

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const validateFirebaseIdToken = async (req, res, next) => {
  if (
    (!req.headers.authorization ||
      !req.headers.authorization.startsWith('Bearer ')) &&
    !(req.cookies && req.cookies.__session)
  ) {
    const err = {
      status: 403,
      reason: 'Unauthorized',
      reason_detail:
        'No Firebase ID token was passed as a Bearer token in the Authorization header or as cookie',
    };
    handleError(err, res);
    return;
  }

  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    console.log("Found Authorization header");
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else if (req.cookies) {
    console.log("Found __session cookie");
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    const err = {
      status: 403,
      reason: 'Unauthorized',
    };
    handleError(err, res);
    return;
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    console.log('ID Token correctly decoded', decodedIdToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error);
    const err = {
      status: 403,
      reason: 'Unauthorized',
    };
    handleError(err, res);
    return;
  }
};

const generateRapydHeaders = (httpMethod, urlPath, body = '') => {
  // const salt = parseInt(crypto.randomBytes(5).toString("hex"), 16).toString();
  // Randomly generated for each request.
  const salt = cryptoJS.lib.WordArray.random(12).toString();
  const timestamp = (Math.floor(new Date().getTime() / 1000) - 10).toString();
  const toSign =
    httpMethod +
    urlPath +
    salt +
    timestamp +
    rapydAccessKey +
    rapydSecretKey +
    body;
  let signature = cryptoJS.enc.Hex.stringify(
    // eslint-disable-next-line new-cap
    cryptoJS.HmacSHA256(toSign, rapydSecretKey)
  );
  signature = cryptoJS.enc.Base64.stringify(cryptoJS.enc.Utf8.parse(signature));
  return {
    'Content-Type': 'application/json',
    access_key: rapydAccessKey,
    salt: salt,
    timestamp: timestamp,
    signature: signature,
  };
};

const createUserHelper = async (email, businessID, group, perks) => {
  const docRef = db.collection("users").doc(email);

  await docRef.set({
    businessID,
    group,
    perks: [],
  });

  const signInLink = await admin.auth().generateSignInWithEmailLink(email, {
    url: "http://localhost:3000/dashboard", // I don't think you're supposed to do it this way. Maybe less secure
  });

  // send email
  await db.collection("mail").add({
    to: email,
    message: {
      subject: "Your employer has signed you up for Perkify!",
      text: `
        Your employer purchased these Perks for you:\n
        ${perks} 
        
        Use this link to sign into your account and redeem your Perks: ${signInLink}.\n 
        `,
    },
  });
};

const deleteUserHelper = async (userDoc) => {
  console.log("working2");
  console.log(userDoc.data());
  console.log(userDoc.id);
  const user = userDoc.data();

  // TODO: cannot delete users with issued cards. API does not allow it...
  // if (user.contactId) {
  //   const deleteContactResults = await deleteContact(walletID, user.contactId);
  //   console.log("deletingcard");
  //   console.log(deleteContactResults);
  // }

  if (user.cardID) {
    const blockCardResults = await blockCard(user.cardID);
    console.log(blockCardResults);
  }

  const deleteUserResults = await db
    .collection("users")
    .doc(userDoc.id)
    .delete();
  console.log(deleteUserResults);
};

// * Validation Helpers * //

// gmail treats emails with and without dots as the same.
// we don't want to take this into account
const emailNormalizationOptions = {
  gmail_remove_dots: false,
  gmail_remove_subaddress: false,
  gmail_convert_googlemaildotcom: false,
  outlookdotcom_remove_subaddressf: false,
  yahoo_remove_subaddress: false,
  icloud_remove_subaddress: false,
};

/*
const validateUserEmail = async (email) => {
  const userRef = await db.collection('users').doc(email).get();
  if (!userRef.exists) {
    return Promise.reject(new Error('You are not added by your employer'));
  } else {
    return Promise.resolve();
  }
};
 */

const validateEmails = async (emails) => {
  if (Array.isArray(emails) && emails.length > 0) {
    for (const email of emails) {
      console.log(email);
      if (!validator.isEmail(email)) {
        return Promise.reject(new Error(`email: ${email} is not email`));
      }
    }
  } else {
    return Promise.reject(new Error('send array of emails'));
  }
  return Promise.resolve();
};

const sanitizeEmails = (emails) => {
  return emails.map((email) =>
    validator.normalizeEmail(email, emailNormalizationOptions)
  );
};

const validatePerks = async (perks) => {
  if (Array.isArray(perks) && perks.length > 0) {
    for (const perk of perks) {
      if (!allPerks.some((truePerk) => truePerk.Name === perk)) {
        return Promise.reject(new Error(`perk: ${perk} is not supported`));
      }
    }
  } else {
    return Promise.reject(new Error('send array of perks'));
  }
  return Promise.resolve();
};

// --------------- Rapyd API Calls --------------- //

const createWallet = async (
  firstName,
  lastName,
  email,
  businessName,
  line1,
  city,
  state,
  zip,
  phone
) => {
  const httpMethod = 'post';
  const urlPath = '/v1/user';

  // TODO: improve this logic
  if (phone.length == 10) {
    phone = '+1' + phone;
  } else if (phone.length == 11) {
    phone = '+' + phone;
  }
  console.log(phone);

  const body = {
    first_name: businessName,
    type: 'company',
    contact: {
      phone_number: phone,
      email: email,
      first_name: firstName,
      last_name: lastName,
      contact_type: 'business',
      address: {
        name: businessName,
        line_1: line1,
        city: city,
        state: state,
        country: 'US',
        zip: zip,
        phone_number: phone,
      },
      country: 'US',
      business_details: {
        entity_type: 'company',
        name: businessName,
        address: {
          name: businessName,
          line_1: line1,
          city: city,
          state: state,
          country: 'US',
          zip: zip,
          phone_number: phone,
        },
      },
    },
  };
  /*
  const body = {
    "first_name": "Henry Company",
    "type": "company",
    "contact": {
      "phone_number": "+14155588799",
      "email": "sanboxtest@rapyd.net",
      "first_name": "Mary",
      "last_name": "Chen",
      "contact_type": "business",
      "address": {
        "name": "Henry Company",
        "line_1": "888 Some Street",
        "city": "Anytown",
        "state": "NY",
        "country": "US",
        "zip": "12345",
        "phone_number": "+14155588799",
      },
      "country": "US",
      "business_details": {
        "entity_type": "company",
        "name": "Henry Company",
        "address": {
          "name": "Henry Company",
          "line_1": "888 Some Street",
          "line_2": "Suite 1200",
          "city": "Anytown",
          "state": "NY",
          "country": "US",
          "zip": "10101",
          "phone_number": "+14155588799",
        },
      },
    },
  };
   */
  /*
  const body = {
    "first_name": businessName,
    "type": "company",
    "contact": {
      "phone_number": phone,
      "email": email,
      "first_name": firstName,
      "last_name": lastName,
      "contact_type": "business",
      "address": {
        "name": businessName,
        "line_1": line1,
        "city": city,
        "state": state,
        "country": "US",
        "zip": zip,
        "phone_number": phone,
      },
      "country": "US",
      "business_details": {
        "entity_type": "company",
        "name": businessName,
        "address": {
          "name": businessName,
          "line_1": line1,
          "city": city,
          "state": state,
          "country": "US",
          "zip": zip,
          "phone_number": phone,
        },
      },
    },
  };
   */
  const headers = generateRapydHeaders(
    httpMethod,
    urlPath,
    JSON.stringify(body)
  );
  console.log(headers);
  try {
    const walletResp = await axios({
      method: httpMethod,
      url: urlPath,
      headers,
      data: body,
    });
    const walletID = walletResp.data.data.id;
    const contactID = walletResp.data.data.contacts.data[0].id;
    console.log(walletID);
    console.log(contactID);
    return { walletID, contactID };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/*
const getWallet = async (walletID) => {
  const httpMethod = 'get';
  const urlPath = '/v1/user/' + walletID;
  const headers = generateRapydHeaders(httpMethod, urlPath);
  try {
    const walletResp = await axios({
      method: httpMethod,
      url: urlPath,
      headers,
    });
    // const walletAddress = walletResp.data.data.contacts.data[0].business_details.address;
    return walletResp.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const addContact = async (
    walletID,
    firstName,
    lastName,
    email,
    address,
    city,
    state,
    zip,
    dob
) => {
  // TODO: fix DOB static
  const httpMethod = 'post';
  const urlPath = `/v1/ewallets/${walletID}/contacts`;
  const body = {
    first_name: firstName,
    last_name: lastName,
    contact_type: 'personal',
    email: email,
    date_of_birth: '11/22/2000',
    country: 'US',
    address: {
      name: firstName + ' ' + lastName,
      line_1: address,
      city: city,
      state: state,
      zip: zip,
    },
  };

  const headers = generateRapydHeaders(
      httpMethod,
      urlPath,
      JSON.stringify(body)
  );
  try {
    const newContact = await axios({
      method: httpMethod,
      url: urlPath,
      headers,
      data: body,
    });
    return newContact.data;
  } catch (e) {
    console.error('in add contact');
    console.error(e);
    throw e;
  }
};

const getContact = async (walletID, contactID) => {
  const httpMethod = "get";
  const urlPath = `/v1/ewallets/${walletID}/contacts/${contactID}`;
  const headers = generateRapydHeaders(httpMethod, urlPath);
  try {
    const contactResp = await axios({
      method: httpMethod,
      url: urlPath,
      headers,
    });
    // const walletAddress = walletResp.data.data.contacts.data[0].business_details.address;
    return contactResp.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const deleteContact = async (walletID, contactID) => {
  const httpMethod = "delete";
  const urlPath = `/v1/ewallets/${walletID}/contacts/${contactID}`;
  const headers = generateRapydHeaders(httpMethod, urlPath);
  try {
    const contactResp = await axios({
      method: httpMethod,
      url: urlPath,
      headers,
    });
    // const walletAddress = walletResp.data.data.contacts.data[0].business_details.address;
    return contactResp.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
 */

const depositWallet = async (walletID, amount) => {
  const httpMethod = 'post';
  const urlPath = '/v1/account/deposit';
  const body = {
    ewallet: walletID,
    amount: amount.toString(),
    currency: 'USD',
  };
  const headers = generateRapydHeaders(
    httpMethod,
    urlPath,
    JSON.stringify(body)
  );
  try {
    const walletResp = await axios({
      method: httpMethod,
      url: urlPath,
      headers,
      data: body,
    });
    // const walletAddress = walletResp.data.data.contacts.data[0].business_details.address;
    return walletResp.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/*
const issueCard = async (contactID) => {
  const httpMethod = 'post';
  const urlPath = '/v1/issuing/cards';
  const body = {
    ewallet_contact: contactID,
    country: 'US',
  };
  const headers = generateRapydHeaders(
      httpMethod,
      urlPath,
      JSON.stringify(body)
  );
  try {
    const cardResp = await axios({
      method: httpMethod,
      url: urlPath,
      headers,
      data: body,
    });
    // const walletAddress = walletResp.data.data.contacts.data[0].business_details.address;
    return cardResp.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const activateCard = async (cardID) => {
  const httpMethod = 'post';
  const urlPath = '/v1/issuing/cards/activate';
  const body = {
    card: cardID,
  };
  const headers = generateRapydHeaders(
      httpMethod,
      urlPath,
      JSON.stringify(body)
  );
  try {
    const cardResp = await axios({
      method: httpMethod,
      url: urlPath,
      headers,
      data: body,
    });
    // const walletAddress = walletResp.data.data.contacts.data[0].business_details.address;
    return cardResp.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getCardDetails = async (cardID) => {
  const httpMethod = 'post';
  const urlPath = '/v1/hosted/issuing/card_details/' + cardID;
  const body = {
    card_color: '#f9f9f9',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTNgldxyUfmVPmQV1YpTcDWo_kjX-TO_EiccQ&usqp=CAU',
    language: 'en',
    logo_orientation: 'landscape',
  };
  const headers = generateRapydHeaders(
    httpMethod,
    urlPath,
    JSON.stringify(body)
  );
  try {
    const cardDetails = await axios({
      method: httpMethod,
      url: urlPath,
      headers,
      data: body,
    });
    // const walletAddress = walletResp.data.data.contacts.data[0].business_details.address;
    return cardDetails.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
*/

const blockCard = async (cardID) => {
  const httpMethod = "post";
  const urlPath = "/v1/issuing/cards/status";
  const body = {
    card: cardID,
    status: "block",
  };
  const headers = generateRapydHeaders(
    httpMethod,
    urlPath,
    JSON.stringify(body)
  );
  try {
    const cardResp = await axios({
      method: httpMethod,
      url: urlPath,
      headers,
      data: body,
    });

    return cardResp.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

// --------------- Express Routes --------------- //

const registerAdminAndBusinessValidators = [
  body("firstName").not().isEmpty(),
  body("lastName").not().isEmpty(),
  body("email").isEmail().normalizeEmail(emailNormalizationOptions),
  body("password").not().isEmpty(),
  body("businessName").not().isEmpty(),
  body("line1").not().isEmpty(),
  body("city").not().isEmpty(),
  body("state").isLength({ min: 2, max: 2 }),
  body("postalCode").not().isEmpty(),
];

const registerAdminAndBusiness = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    businessName,
    line1,
    line2,
    city,
    state,
    postalCode,
    ...rest
  } = JSON.parse(req.body);
  // TODO: make sure we still need to do JSON parse
  // let globalWalletID;

  try {
    if (Object.keys(rest).length > 0) {
      const error = {
        status: 400,
        reason: 'extraneous parameters',
        reason_detail: Object.keys(rest).join(','),
      };
      throw error;
    }

    // create company with rapyd API
    const { walletID, contactID } = await createWallet(
      firstName,
      lastName,
      email,
      businessName,
      line1,
      city,
      state,
      postalCode.toString(),
      ""
    );
    console.log(walletID);
    // globalWalletID = walletID;

    const newUser = await admin.auth().createUser({
      email,
      emailVerified: false,
      password,
      displayName: firstName + ' ' + lastName,
      disabled: false,
    });

    const businessRef = await db.collection('businesses').add({
      name: businessName,
      billingAddress: {
        city,
        country: "US",
        line1,
        line2,
        postal_code: postalCode,
        state,
      },
      admins: [newUser.uid],
      groups: {},
    });

    await db.collection('admins').doc(newUser.uid).set({
      email,
      firstName,
      lastName,
      contactID,
      companyID: businessRef.id,
    });

    res.status(200).end();
  } catch (err) {
    // TODO: if globalWalletID is set then use rapid api to delete the wallet
    handleError(err, res);
  }
};

const createGroupValidators = [
  body('group').not().isEmpty(),
  body('emails').custom(validateEmails).customSanitizer(sanitizeEmails),
  body('perks').custom(validatePerks),
];

const createGroup = async (req, res) => {
  const {
    group, // TODO: make this param
    emails,
    perks,
    ...rest
  } = req.body;

  try {
    const errors = validationResult(req);
    console.log(errors.array());
    console.log(perks);
    console.log(emails);
    if (!errors.isEmpty()) {
      const error = {
        status: 400,
        reason: 'Bad Request',
        reason_detail: JSON.stringify(errors.array()),
      };
      throw error;
    }

    if (Object.keys(rest).length > 0) {
      const error = {
        status: 400,
        reason: 'extraneous parameters',
        reason_detail: Object.keys(rest).join(','),
      };
      throw error;
    }

    // get admins business
    const adminSnap = await db.collection('admins').doc(req.user.uid).get();
    const businessID = adminSnap.data().companyID;
    const customerDoc = await db
      .collection('customers')
      .doc(req.user.uid)
      .get();
    const stripeCustomerId = customerDoc.data().stripeId;

    // query business for address and wallet
    const businessSnap = await db
      .collection('businesses')
      .doc(businessID)
      .get();
    const walletID = businessSnap.data().walletID;

    // charge wallet for price*perks*employees
    // TODO: setup monthly charges
    // TODO: charge via rapyd collect
    const perkGroupPerks = allPerks.filter((perk) => perks.includes(perk.Name));
    const price =
      emails.length *
      perkGroupPerks.reduce(
        (accumulator, currentValue) => accumulator + currentValue.Cost,
        0
      );

    await Promise.all(
      perkGroupPerks.map(async (perkObj) => {
        await stripe.subscriptions.create({
          customer: stripeCustomerId,
          items: [{ price: perkObj.stripePriceId }],
        });
      })
    );

    const depositResult = await depositWallet(walletID, price);

    // add group and perks to db
    // TODO: reuse businessSnap
    await db
      .collection('businesses')
      .doc(businessID)
      .update({
        [`groups.${group}`]: perks,
      });

    // make sure all emails are good
    // TODO: we shouldn't use array.filter and still add those right?
    for (const email of emails) {
      const docRef = db.collection("users").doc(email);

      const docSnapshot = await docRef.get();
      if (docSnapshot.exists) {
        const error = {
          status: 400,
          reason: "Bad Request",
          reason_detail: `added email ${email} that is already in another group`,
        };
        throw error;
      }
    }

    const usersToCreate = emails.map((email) =>
      createUserHelper(email, businessID, group, perks)
    );
    await Promise.all(usersToCreate);

    res.json(depositResult).end();
  } catch (err) {
    // TODO: if globalWalletID is set then use rapid api to delete the wallet
    handleError(err, res);
  }
};

const updatePerkGroupValidators = [
  body('group').not().isEmpty(),
  body('emails').custom(validateEmails).customSanitizer(sanitizeEmails),
];

const updatePerkGroup = async (req, res) => {
  const {
    group, // TODO: make this param
    emails,
    perks,
  } = req.body;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = {
        status: 400,
        reason: 'Bad Request',
        reason_detail: JSON.stringify(errors.array()),
      };
      throw error;
    }

    // get admins business
    const adminSnap = await db.collection('admins').doc(req.user.uid).get();
    const businessID = adminSnap.data().companyID;

    console.log(perks);

    if (perks.length != 0) {
      await db
        .collection('businesses')
        .doc(businessID)
        .update({
          [`groups.${group}`]: perks,
        });
    }

    const usersRef = db.collection("users");
    const groupUsersSnapshot = await usersRef.where("group", "==", group).get();

    const deleteUsers = [];
    const oldUserEmails = [];
    groupUsersSnapshot.forEach((userDoc) => {
      if (emails.includes(userDoc.id)) {
        oldUserEmails.push(userDoc.id);
      } else {
        deleteUsers.push(userDoc);
      }
    });

    console.log(`deleteUsers: ${deleteUsers}`);
    console.log(`oldUserEmails: ${oldUserEmails}`);

    // add users
    const addUserEmails = emails.filter(
      (email) => !oldUserEmails.includes(email)
    );
    console.log(`addUserEmails: ${addUserEmails}`);

    // TODO: move this to a function
    for (const email of addUserEmails) {
      const docRef = db.collection("users").doc(email);

      const docSnapshot = await docRef.get();
      if (docSnapshot.exists) {
        const error = {
          status: 400,
          reason: "Bad Request",
          reason_detail: `added email ${email} that is already in another group`,
        };
        throw error;
      }
    }

    // TODO: move this to a function as well and create multiple files
    const usersToCreate = addUserEmails.map((email) =>
      createUserHelper(email, businessID, group, perks)
    );
    await Promise.all(usersToCreate);

    // TODO: move this to a function as well and create multiple files
    const usersToDelete = deleteUsers.map((user) => deleteUserHelper(user));
    await Promise.all(usersToDelete);

    res.status(200).end();
  } catch (err) {
    // TODO: if globalWalletID is set then use rapid api to delete the wallet
    // handleError(err, res);
    console.log('Returning error');
    console.log(err);
    res.status(500).end();
  }
};

const deletePerkGroupValidators = [body('group').not().isEmpty()];

const deletePerkGroup = async (req, res) => {
  const {
    group, // TODO: make this param
  } = req.body;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      const error = {
        status: 400,
        reason: 'Bad Request',
        reason_detail: JSON.stringify(errors.array()),
      };
      throw error;
    }

    // get admins business
    const adminSnap = await db.collection('admins').doc(req.user.uid).get();
    const businessID = adminSnap.data().companyID;

    // TOOD: create helper function to get business info from logged in admin
    // //const businessSnap = await db
    //     .collection("businesses")
    //     .doc(businessID)
    //     .get();

    // const walletID = businessSnap.data().walletID;

    const usersRef = db.collection("users");
    const groupUsersSnapshot = await usersRef.where("group", "==", group).get();

    console.log("working");
    console.log(group);
    console.log(groupUsersSnapshot.size);

    if (!groupUsersSnapshot.empty) {
      const usersToDelete = [];
      groupUsersSnapshot.forEach((userDoc) => {
        usersToDelete.push(deleteUserHelper(userDoc));
      });
      await Promise.all(usersToDelete);
    }

    // delete group from businesss' groups
    await db
      .collection('businesses')
      .doc(businessID)
      .update({
        [`groups.${group}`]: admin.firestore.FieldValue.delete(),
      });

    res.status(200).end();
  } catch (err) {
    console.log('Returning error');
    console.log(err);
    res.status(500).end();
  }
};

const registerUserValidators = [
  body('email')
    .isEmail()
    .normalizeEmail(emailNormalizationOptions)
    .custom(validateUserEmail),
  body('firstName').not().isEmpty(),
  body('lastName').not().isEmpty(),
  body('dob').isDate(),
];

const registerUser = async (req, res) => {
  const { firstName, lastName, ...rest } = req.body;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = {
        status: 400,
        reason: 'Bad Request',
        reason_detail: JSON.stringify(errors.array()),
      };
      throw error;
    }

    if (Object.keys(rest).length > 0) {
      const error = {
        status: 400,
        reason: 'extraneous parameters',
        reason_detail: Object.keys(rest).join(','),
      };
      throw error;
    }

    const email = req.user.email;

    // TODO: get field directly
    const userSnap = await db.collection('users').doc(email).get();
    const businessID = userSnap.data().businessID;
    const businessSnap = await db
      .collection('businesses')
      .doc(businessID)
      .get();
    const billingAddress = businessSnap.data().billingAddress;
    console.log(billingAddress);
    const cardholder = await stripe.issuing.cardholders.create({
      type: "individual",
      name: `${firstName} ${lastName}`,
      email: email,
      billing: {
        address: billingAddress,
      },
      status: "active",
    });
    const cardholderID = cardholder.id;

    const card = await stripe.issuing.cards.create({
      cardholder: cardholderID,
      currency: "usd",
      type: "virtual",
      status: "active",
    });

    const cardDetails = await stripe.issuing.cards.retrieve(card.id, {
      expand: ["number", "cvc"],
    });

    await db
      .collection("users")
      .doc(email)
      .update({
        firstName: firstName,
        lastName: lastName,
        card: {
          id: card.id,
          cardholderID: cardholderID,
          number: cardDetails.number,
          cvc: cardDetails.cvc,
          exp: {
            month: cardDetails.exp_month,
            year: cardDetails.exp_year,
          },
          // billing address saved with card for both ease of access and so if business
          // billing address changes card still works without having to reissue cards
          // TODO: remove this make billing address changes reissue cards?
          billing: {
            address: billingAddress,
          },
        },
      });

    res.status(200).end();
  } catch (err) {
    handleError(err, res);
  }
};

const getStripePaymentMethods = async (req, res) => {
  try {
    const { customer, type } = req.body;
    const paymentMethods = await stripe.paymentMethods.list({
      customer,
      type,
    });

    res.json(paymentMethods).end();
  } catch (e) {
    console.log('Error in getting stripe payment methods');
  }
};

app.use('/auth', validateFirebaseIdToken);
app.post(
  '/registerAdminAndBusiness',
  registerAdminAndBusinessValidators,
  registerAdminAndBusiness
);
app.post('/registerUser', registerUserValidators, registerUser);
app.post('/auth/createGroup', createGroupValidators, createGroup);
app.put('/auth/updatePerkGroup', updatePerkGroupValidators, updatePerkGroup);
app.post('/auth/deletePerkGroup', deletePerkGroupValidators, deletePerkGroup);
app.post('/stripePaymentMethods', getStripePaymentMethods);

exports.user = functions.https.onRequest(app);
