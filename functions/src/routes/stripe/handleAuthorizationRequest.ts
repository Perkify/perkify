import { stripe } from '../../models';

export const handleAuthorizationRequest = async (auth) => {
  // Authorize the transaction.
  console.log(auth);
  await stripe.issuing.authorizations.approve(auth['id']);
};
