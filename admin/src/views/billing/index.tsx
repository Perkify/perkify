import Header from 'components/Header';
import { AuthContext, LoadingContext } from 'contexts';
import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { PerkifyApi } from 'services';

const Billing = () => {
  const history = useHistory();
  const { currentUser } = useContext(AuthContext);
  const { dashboardLoading, setDashboardLoading, freezeNav, setFreezeNav } =
    useContext(LoadingContext);

  setFreezeNav(true);
  useEffect(() => {
    (async () => {
      setDashboardLoading(true);

      const payload: CreatePortalLinkPayload = {
        returnUrl: window.location.origin + '/dashboard',
      };

      const bearerToken = await currentUser.getIdToken();
      console.log(bearerToken);
      const { data } = await PerkifyApi.post('rest/portalLink', payload, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      });
      // const functionRef = functions.httpsCallable('createPortalLink');
      // const { data } = await functionRef({
      //   returnUrl: window.location.origin + '/dashboard',
      // });
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
