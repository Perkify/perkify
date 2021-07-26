import { AuthContext } from 'contexts/Auth';
import { auth, db } from 'firebaseApp';
import React, { useContext, useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import GettingStarted from '../views/gettingStarted';

const PrivateRoute = ({ component: RouteComponent, ...rest }) => {
  const { currentUser, loadingAuthState, employee } = useContext(AuthContext);

  useEffect(() => {
    const checkUser = async () => {
      // TODO: auth roles
      // this is here to ensure for example if an admin is logged in then they should not be accessing the user side as an admin
      // the better long term solution is probs to use auth roles and check the account is logged in as either a user or admin
      if (currentUser) {
        const userDoc = await db
          .collection('users')
          .doc(currentUser.email)
          .get();
        // could also check for employee data here
        if (!userDoc.exists) {
          await auth.signOut();
          alert('You have not yet been added by your employer');
        }
      }
    };
    checkUser();
  }, [currentUser]);

  return (
    <Route
      {...rest}
      render={(routeProps) => {
        if (!currentUser && !loadingAuthState) {
          return <Redirect to={'/login'} />;
        } else if (!loadingAuthState && !employee?.card) {
          // could also put this in the dashboard view. Put it in here in case in future there are other private routes
          return <GettingStarted />;
        } else {
          return <RouteComponent {...routeProps} />;
        }
      }}
    />
  );
};

export default PrivateRoute;
