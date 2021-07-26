import Header from 'components/Header';
import { LoadingContext } from 'contexts';
import { functions } from 'firebaseApp';
import React, { useContext, useEffect } from 'react';

const Billing = () => {
  const { dashboardLoading, setDashboardLoading } = useContext(LoadingContext);

  useEffect(() => {
    (async () => {
      setDashboardLoading(true);
      const functionRef = functions.httpsCallable(
        'ext-firestore-stripe-subscriptions-createPortalLink'
      );
      const { data } = await functionRef({
        returnUrl: window.location.origin,
      });
      console.log(data);
      window.location.assign(data.url);
    })();
  }, []);
  return (
    <div>
      <Header title="Billing" crumbs={['Dashboard', 'Account', 'Billing']} />
      <p>Redirecting you to the billing portal...</p>
    </div>
  );
};

export default Billing;
