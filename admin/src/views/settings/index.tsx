import Header from 'components/Header';
import { AuthContext } from 'contexts';
import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';

const Settings = () => {
  const history = useHistory();
  const { currentUser } = useContext(AuthContext);
  // const { dashboardLoading, setDashboardLoading, freezeNav, setFreezeNav } =
  //   useContext(LoadingContext);

  // setFreezeNav(true);
  // useEffect(() => {
  //   (async () => {
  //     setDashboardLoading(true);

  //     const payload: CreatePortalLinkPayload = {
  //       returnUrl: window.location.origin + '/dashboard',
  //     };

  //     const bearerToken = await currentUser.getIdToken();
  //     console.log(bearerToken);
  //     const { data } = await PerkifyApi.post('rest/portalLink', payload, {
  //       headers: {
  //         Authorization: `Bearer ${bearerToken}`,
  //         'Content-Type': 'application/json',
  //       },
  //     });
  //     // const functionRef = functions.httpsCallable('createPortalLink');
  //     // const { data } = await functionRef({
  //     //   returnUrl: window.location.origin + '/dashboard',
  //     // });
  //     history.push('/dashboard');
  //     window.location.assign(data.url);
  //   })();
  // }, []);
  return (
    <div>
      <Header title="Settings" crumbs={['Dashboard', 'Account', 'Settings']} />

      {/* <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        }}
      /> */}
      {/* <p>Redirecting you to the settings portal...</p> */}
    </div>
  );
};

export default Settings;
