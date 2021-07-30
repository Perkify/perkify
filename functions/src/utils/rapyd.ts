import axios from 'axios';
import * as cryptoJS from 'crypto-js';
import { rapydAccessKey, rapydSecretKey } from '../configs';

// --------------- Rapyd API Calls --------------- //

export const generateRapydHeaders = (httpMethod, urlPath, body = '') => {
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

export const createWallet = async (
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
  try {
    const walletResp = await axios({
      method: httpMethod,
      url: urlPath,
      headers,
      data: body,
    });
    const walletID = walletResp.data.data.id;
    const contactID = walletResp.data.data.contacts.data[0].id;
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

export const depositWallet = async (walletID, amount) => {
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

export const blockCard = async (cardID) => {
  const httpMethod = 'post';
  const urlPath = '/v1/issuing/cards/status';
  const body = {
    card: cardID,
    status: 'block',
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
