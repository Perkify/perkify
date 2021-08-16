import { db, stripe } from '../../models';

export const getStripePaymentMethods = async (req, res, next) => {
  const adminData = (
    await db.collection('admins').doc(req.user.uid).get()
  ).data() as Admin;
  const businessData = (
    await db.collection('businesses').doc(adminData.companyID).get()
  ).data();

  if (!businessData || businessData.stripeId == undefined) {
    const error = {
      status: 500,
      reason: 'Missing stripeId',
      reasonDetail: `Document missing stripeId in firestore`,
    };
    return next(error);
  }

  const paymentMethods = await stripe.paymentMethods.list({
    customer: businessData.stripeId,
    type: 'card',
  });

  res.json(paymentMethods).end();
};
