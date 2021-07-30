import { db, stripe } from '../../models';

export const getStripePaymentMethods = async (req, res, next) => {
  const customerDoc = await db.collection('customers').doc(req.user.uid).get();
  const customerData = customerDoc.data();

  if (!customerData || customerData.stripeId == undefined) {
    const error = {
      status: 500,
      reason: 'Missing stripeId',
      reasonDetail: `Document missing stripeId in firestore`,
    };
    return next(error);
  }

  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerData.stripeId,
    type: 'card',
  });

  res.json(paymentMethods).end();
};
