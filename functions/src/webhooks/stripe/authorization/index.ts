import Stripe from 'stripe';
import { issuingAuthorizationRequestWebhookStripeSecret } from '../../../configs';
import { functions, stripe } from '../../../services';
import { errorHandler } from '../../../utils';
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
        issuingAuthorizationRequestWebhookStripeSecret
      );
    } catch (err) {
      console.log(err);
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    try {
      if (event.type === 'issuing_authorization.request') {
        const auth = event.data.object as Stripe.Issuing.Authorization;
        await handleAuthorizationRequest(auth);
      }
    } catch (err) {
      errorHandler(err, request, response);
    }

    response.json({ received: true });
  });
