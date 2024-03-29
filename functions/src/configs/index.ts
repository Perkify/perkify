// RAPYD
import { functions } from '../services';

// STRIPE
export const privateStripeKey =
  functions.config()['stripe-firebase'].environment == 'production'
    ? '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'
    : 'sk_test_51JBSAtKuQQHSHZsmj9v16Z0VqTxLfK0O9KGzcDNq0meNrEZsY4sEN29QVZ213I5kyo0ssNwwTFmnC0LHgVurSnEn00Gn0CjfBu';

export const issuingAuthorizationRequestWebhookStripeSecret =
  functions.config()['stripe-firebase'].environment == 'production'
    ? 'whsec_QJxtG8dhmlGsnsu1YkayYj3BuP7xtJxo'
    : functions.config()['stripe-firebase'].environment == 'staging'
    ? 'whsec_sipiyvURbVzUUdNKhc36vJG4gmodcAHM'
    : // webhook secret for stripe cli --forward
      'whsec_gfvRf6OpELfDLb1OqxaiKJxVscZ5qMVP';

export const invoicePaidWebhookStripeSecret =
  functions.config()['stripe-firebase'].environment == 'production'
    ? 'whsec_97xzLr3UH6REEOq4AyIYGm1tyku0W5nO'
    : functions.config()['stripe-firebase'].environment == 'staging'
    ? 'whsec_9BCaB7yGPdhSiZgjTD0OdoRHbcM7U83I'
    : // webhook secret for stripe cli --forward
      'whsec_gfvRf6OpELfDLb1OqxaiKJxVscZ5qMVP';

export const syncToFirestoreWebhookStripeSecret =
  functions.config()['stripe-firebase'].environment == 'production'
    ? 'whsec_krwTeC89777ZGtSjJUoCLcYCy3ajc3my'
    : functions.config()['stripe-firebase'].environment == 'staging'
    ? 'whsec_QL85oNjF7Aa1xklO1FLRjvLPRiT3m7Gm'
    : // webhook secret for stripe cli --forward
      'whsec_gfvRf6OpELfDLb1OqxaiKJxVscZ5qMVP';
