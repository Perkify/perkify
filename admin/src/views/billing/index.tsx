import Header from 'components/Header';
import { LoadingContext } from 'contexts';
import { functions } from 'firebaseApp';
import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const Billing = () => {
  const history = useHistory();
  const { dashboardLoading, setDashboardLoading, freezeNav, setFreezeNav } =
    useContext(LoadingContext);

  setFreezeNav(true);
  useEffect(() => {
    (async () => {
      setDashboardLoading(true);
      const functionRef = functions.httpsCallable(
        'ext-firestore-stripe-subscriptions-createPortalLink'
      );
      const { data } = await functionRef({
        returnUrl: window.location.origin + '/dashboard',
      });
      history.push('/dashboard');
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
