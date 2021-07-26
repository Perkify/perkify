import { db, stripe } from 'models';

export const getStripePaymentMethods = async (req, res) => {
  const customerDoc = await db.collection('customers').doc(req.user.uid).get();
  const customerData = customerDoc.data();

  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerData.stripeId,
    type: 'card',
  });

  res.json(paymentMethods).end();
};
