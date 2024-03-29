import Header from 'components/Header';
import React, { useEffect } from 'react';
import { auth } from 'services';

const Login = () => {
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
    <div style={{ margin: '60px 20px 20px 20px', padding: '20px' }}>
      <Header title="Logging You Out" crumbs={['Dashboard', 'Logout']} />
    </div>
  );
};

export default Login;
