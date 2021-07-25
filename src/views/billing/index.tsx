import Header from 'components/Header';
import { functions } from 'firebaseApp';
import React, { useEffect } from 'react';

const Billing = () => {
  useEffect(() => {
    (async () => {
      const functionRef = functions.httpsCallable(
        'ext-firestore-stripe-subscriptions-createPortalLink'
      );
      const { data } = await functionRef({ returnUrl: window.location.origin });
      window.location.assign(data.url);
    })();
  });

  return (
    <div>
      <Header title="Billing" crumbs={['Dashboard', 'Account', 'Billing']} />
      <p>Redirecting you to the billing portal...</p>
    </div>
  );
};

export default Billing;
