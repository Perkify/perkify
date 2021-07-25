import Header from 'components/Header';
import { AuthContext } from 'contexts';
import React, { useContext, useEffect } from 'react';

const Billing = () => {
  const { customerPortalUrl } = useContext(AuthContext);

  useEffect(() => {
    if (customerPortalUrl != '') {
      window.location.assign(customerPortalUrl);
    }
  }, [customerPortalUrl]);
  return (
    <div>
      <Header title="Billing" crumbs={['Dashboard', 'Account', 'Billing']} />
      <p>Redirecting you to the billing portal...</p>
    </div>
  );
};

export default Billing;
