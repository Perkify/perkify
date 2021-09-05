import Header from 'components/Header';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { auth } from 'services';

const GeneralDashboard = () => {
  const history = useHistory();
  useEffect(() => {
    auth.signOut().then(
      () => {
        window.location.assign('/login');
      },
      (error) => {
        console.error('Sign out error');
      }
    );
  }, []);
  return (
    <div>
      <Header title="Logging You Out" crumbs={['Dashboard', 'Logout']} />
    </div>
  );
};

export default GeneralDashboard;
