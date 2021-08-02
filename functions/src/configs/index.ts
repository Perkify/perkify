// RAPYD

// rapyd credentials
export const rapydSecretKey =
  '9ddd95bd2a2beb670c8297afec7fdea3a8cca2f64488d30e394aeebf5208d9c78e4f9c0a6ac0d5c8';
export const rapydAccessKey = 'C8CF6F6A88C4B7A1DEC8';
// rapyd base uri
export const rapydBaseURL = 'https://sandboxapi.rapyd.net';

// STRIPE
export const privateStripeKey =
  process.env.FIREBASE_STRIPE_ENVIRONMENT == 'production'
    ? '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'
    : 'sk_test_51JBSAtKuQQHSHZsmj9v16Z0VqTxLfK0O9KGzcDNq0meNrEZsY4sEN29QVZ213I5kyo0ssNwwTFmnC0LHgVurSnEn00Gn0CjfBu';

export const stripeWebhookSecret =
  process.env.FIREBASE_STRIPE_ENVIRONMENT == 'production'
    ? 'whsec_QJxtG8dhmlGsnsu1YkayYj3BuP7xtJxo'
    : 'whsec_sipiyvURbVzUUdNKhc36vJG4gmodcAHM';
