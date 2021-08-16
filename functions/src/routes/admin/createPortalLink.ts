import { body, validationResult } from 'express-validator';
import { db, stripe } from '../../models';

export const createPortalLinkValidators = [body('returnUrl').not().isEmpty()];
/**
 * Create a billing portal link
 */
export const createPortalLink = async (req, res, next) => {
  const { returnUrl } = req.body;

  const errors = validationResult(req);
  console.log(errors, errors.isEmpty());
  if (!errors.isEmpty()) {
    const error = {
      status: 400,
      reason: 'Bad Request',
      reasonDetail: JSON.stringify(errors.array()),
    };
    return next(error);
  }

  const uid = req.user.uid;

  try {
    if (!uid) throw new Error('Not authenticated!');
    const return_url = returnUrl;

    // get admin
    const admin = (
      await db.collection('admins').doc(uid).get()
    ).data() as Admin;

    // get stripe customer id
    const business = (
      await db.collection('businesses').doc(admin.businessID).get()
    ).data()?.stripeId;
    const session = await stripe.billingPortal.sessions.create({
      customer: business,
      return_url,
    });
    //       logs.createdBillingPortalLink(uid);
    return session;
  } catch (error) {
    //       logs.billingPortalLinkCreationError(uid, error);
    //       throw new functions.https.HttpsError('internal', error.message);
    next(error);
  }
};
