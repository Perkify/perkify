"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripe = exports.auth = exports.db = void 0;
const admin = require("firebase-admin");
const stripe_1 = require("stripe");
const configs_1 = require("../configs");
admin.initializeApp();
// axios.defaults.baseURL = rapydBaseURL;
const db = admin.firestore();
exports.db = db;
const auth = admin.auth();
exports.auth = auth;
const stripe = new stripe_1.default(configs_1.privateStripeKey, {
    apiVersion: "2020-08-27",
});
exports.stripe = stripe;
exports.default = admin;
//# sourceMappingURL=index.js.map