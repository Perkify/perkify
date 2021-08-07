import { stripeWebhookSecret } from '../../configs';
import { functions, stripe } from '../../models';
import { handleError } from '../../utils';
import { handleAuthorizationRequest } from './handleAuthorizationRequest';

export const stripeWebhooks = async (request, response) => {
  const sig = request.headers['stripe-signature'];

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
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  functions.logger.log('Event log:', JSON.stringify(event));
  try {
    if (event.type === 'issuing_authorization.request') {
      const auth = event.data.object;
      await handleAuthorizationRequest(auth);
    }
  } catch (err) {
    handleError(err, response);
  }

  response.json({ received: true });
};
