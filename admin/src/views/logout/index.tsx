import Header from 'components/Header';
import { auth } from 'firebaseApp';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const GeneralDashboard = () => {
  const history = useHistory();
  useEffect(() => {
    auth.signOut().then(
      () => {
        history.push('/login');
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
