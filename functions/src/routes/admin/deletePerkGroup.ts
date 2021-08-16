import { body, validationResult } from 'express-validator';
import admin, { db } from '../../models';
import { updateStripeSubscription } from '../../utils';

export const deletePerkGroupValidators = [body('group').not().isEmpty()];

export const deletePerkGroup = async (req, res, next) => {
  const {
    group, // TODO: make this param
  } = req.body;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = {
        status: 400,
        reason: 'Bad Request',
        reasonDetail: JSON.stringify(errors.array()),
      };
      return next(error);
    }

    // get admins business
    const adminData = (
      await db.collection('admins').doc(req.user.uid).get()
    ).data();

    if (adminData == null) {
      const error = {
        status: 500,
        reason: 'Missing documents',
        reasonDetail: `Documents missing from firestore`,
      };
      return next(error);
    }
    const businessID = adminData.companyID;

    // delete group from businesss' groups
    await db
      .collection('businesses')
      .doc(businessID)
      .update({
        [`groups.${group}`]: admin.firestore.FieldValue.delete(),
      });

    try {
      await updateStripeSubscription(businessID);
    } catch (e) {
      next(e);
    }

    // sync stripe subscriptions with perks
    res.status(200).end();
  } catch (err) {
    res.status(500).end();
  }
};
