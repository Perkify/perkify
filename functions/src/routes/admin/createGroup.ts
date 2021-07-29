import { body, validationResult } from 'express-validator';
import { allPerks } from '../../../shared';
import { db, stripe } from '../../models';
import {
  createUserHelper,
  handleError,
  sanitizeEmails,
  validateEmails,
  validatePerks,
} from '../../utils';

export const createGroupValidators = [
  body('group').not().isEmpty(),
  body('emails').custom(validateEmails).customSanitizer(sanitizeEmails),
  body('perks').custom(validatePerks),
];

export const createGroup = async (req, res, next) => {
  const {
    group, // TODO: make this param
    emails,
    perks,
    ...rest
  } = req.body;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = {
        status: 400,
        reason: 'Bad Request',
        reason_detail: JSON.stringify(errors.array()),
      };
      return next(error);
    }

    if (Object.keys(rest).length > 0) {
      const error = {
        status: 400,
        reason: 'extraneous parameters',
        reason_detail: Object.keys(rest).join(','),
      };
      return next(error);
    }

    // make sure all emails are good
    // TODO: we shouldn't use array.filter and still add those right?
    for (const email of emails) {
      const docRef = db.collection('users').doc(email);

      const docSnapshot = await docRef.get();
      if (docSnapshot.exists && docSnapshot.data()?.businessID) {
        const error = {
          status: 400,
          reason: 'Bad Request',
          reason_detail: `added email ${email} that is already in another group`,
        };
        return next(error);
      }
    }

    // get admins business
    const adminData = (
      await db.collection('admins').doc(req.user.uid).get()
    ).data();
    const customerData = (
      await db.collection('customers').doc(req.user.uid).get()
    ).data();

    if (adminData == null || customerData == null) {
      const error = {
        status: 500,
        reason: 'Missing documents',
        reason_detail: `Documents missing from firestore`,
      };
      return next(error);
    }

    const businessID = adminData.companyID;
    const stripeCustomerId = customerData.stripeId;

    // charge wallet for price*perks*employees
    // TODO: setup monthly charges
    // TODO: charge via rapyd collect
    const perkGroupPerks = allPerks.filter((perk) => perks.includes(perk.Name));
    // const price =
    //   emails.length *
    //   perkGroupPerks.reduce(
    //     (accumulator, currentValue) => accumulator + currentValue.Cost,
    //     0
    //   );

    await Promise.all(
      perkGroupPerks.map(async (perkObj) => {
        await stripe.subscriptions.create({
          customer: stripeCustomerId,
          items: [{ price: perkObj.stripePriceId }],
        });
      })
    );

    // add group and perks to db
    // TODO: reuse businessSnap
    await db
      .collection('businesses')
      .doc(businessID)
      .update({
        [`groups.${group}`]: perks,
      });

    const usersToCreate = emails.map((email) =>
      createUserHelper(email, businessID, group, perks)
    );
    await Promise.all(usersToCreate);

    res.status(200).end();
  } catch (err) {
    // TODO: if globalWalletID is set then use rapid api to delete the wallet
    handleError(err, res);
  }
};
