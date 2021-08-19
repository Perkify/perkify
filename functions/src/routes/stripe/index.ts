import { Stripe } from 'stripe';
import { stripeWebhookSecret } from '../../configs';
import { db, stripe } from '../../models';
import { handleError } from '../../utils';
import { handleAuthorizationRequest } from './handleAuthorizationRequest';

const insertPaymentMethod = async (
  paymentMethod: Stripe.PaymentMethod
): Promise<void> => {
  // get the business reference
  const docRef = db
    .collection('businesses')
    .doc(paymentMethod.customer as string);

  if (paymentMethod.card) {
    // only support card payment methods for now
    const card = paymentMethod.card;
    await docRef.update(`cardPaymentMethods.${card.fingerprint}`, {
      brand: card.brand,
      country: card.country,
      expMonth: card.exp_month,
      expYear: card.exp_year,
      funding: card.funding,
      last4: card.last4,
    });
  } else {
    console.error('Payment method added that is not a card');
  }
};

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

  try {
    if (event.type === 'issuing_authorization.request') {
      const auth = event.data.object;
      await handleAuthorizationRequest(auth);
    } else if (
      [
        'payment_method.attached',
        'payment_method.automatically_updated',
        'payment_method.updated',
      ].includes(event.type)
    ) {
      await insertPaymentMethod(event.data.object as Stripe.PaymentMethod);
    }
  } catch (err) {
    handleError(err, response);
  }

  response.json({ received: true });
};
