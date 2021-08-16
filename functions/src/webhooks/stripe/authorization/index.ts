import { stripeWebhookSecret } from '../../../configs';
import { functions, stripe } from '../../../models';
import { handleError } from '../../../utils';
import { handleAuthorizationRequest } from './handleAuthorizationRequest';

export const issuingAuthorizationRequestWebhookHandler =
  functions.https.onRequest(async (request, response) => {
    const sig = request.headers['stripe-signature'];

    if (!sig) {
      response.status(400).send(`Stripe signature missing`);
      return;
    }

    let event;

    // Verify webhook signature and extract the event.
    try {
      event = stripe.webhooks.constructEvent(
        request.rawBody,
        sig,
        stripeWebhookSecret
      );
    } catch (err) {
      console.log(err);
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    try {
      if (event.type === 'issuing_authorization.request') {
        const auth = event.data.object;
        await handleAuthorizationRequest(auth);
      }
    } catch (err) {
      handleError(err, response);
    }

    response.json({ received: true });
  });
