import { stripe } from '../../models';
import { stripeWebhookSecret } from '../../configs';
import { handleAuthorizationRequest } from './handleAuthorizationRequest';

export const stripeWebhooks = async (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  console.log(request.body);
  console.log(sig);
  console.log(stripeWebhookSecret);
  // Verify webhook signature and extract the event.
  try {
    event = stripe.webhooks.constructEvent(
      request.rawBody,
      sig,
      stripeWebhookSecret
    );
    console.log(JSON.stringify(event));
  } catch (err) {
    console.log('error');
    console.log(err);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('test3');
  if (event.type === 'issuing_authorization.request') {
    const auth = event.data.object;
    await handleAuthorizationRequest(auth);
  }

  response.json({ received: true });
};
