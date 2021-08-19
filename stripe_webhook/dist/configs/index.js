"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhookSecret = exports.privateStripeKey = void 0;
exports.privateStripeKey = process.env.NODE_ENV == "production"
    ? "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"
    : "sk_test_51JBSAtKuQQHSHZsmj9v16Z0VqTxLfK0O9KGzcDNq0meNrEZsY4sEN29QVZ213I5kyo0ssNwwTFmnC0LHgVurSnEn00Gn0CjfBu";
exports.stripeWebhookSecret = process.env.NODE_ENV == "production"
    ? "whsec_QJxtG8dhmlGsnsu1YkayYj3BuP7xtJxo"
    : "whsec_gfvRf6OpELfDLb1OqxaiKJxVscZ5qMVP";
//# sourceMappingURL=index.js.map