import { AuthContext } from 'contexts/Auth';
import firebase from 'firebase';
import React, { useContext, useEffect, useRef } from 'react';
import { Route, useHistory, useLocation } from 'react-router-dom';
import { auth, db } from 'services';
import GettingStarted from '../views/gettingStarted';

interface PrivateRouteProps {
  component: React.ElementType;
  [key: string]: any;
}

const PrivateRoute = ({
  component: RouteComponent,
  ...rest
}: PrivateRouteProps) => {
  const { currentUser, loadingAuthState, employee } = useContext(AuthContext);
  const redirectLoginTimer = useRef(null);
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    if (!firebase.auth().isSignInWithEmailLink(location.search)) {
      redirectLoginTimer.current = setTimeout(() => {
        history.push('/login');
      }, 2000);
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      // TODO: auth roles
      // this is here to ensure for example if an admin is logged in then they should not be accessing the user side as an admin
      // the better long term solution is probs to use auth roles and check the account is logged in as either a user or admin
      if (currentUser) {
        const userDoc = await db
          .collectionGroup('employees')
          .where('employeeID', '==', currentUser.uid)
          .get();
        if (userDoc.empty) {
          await auth.signOut();
          alert('You have not yet been added by your employer');
        }
      }
    };
    checkUser();
  }, [currentUser]);

  useEffect(() => {
    if (!loadingAuthState && currentUser && employee) {
      clearTimeout(redirectLoginTimer.current);
    }
  }, [loadingAuthState, currentUser, employee]);

  return (
    <Route
      {...rest}
      render={(routeProps) => {
        if (!loadingAuthState && currentUser && employee) {
          if (!employee?.card) {
            // could also put this in the dashboard view. Put it in here in case in future there are other private routes
            return <GettingStarted />;
          } else {
            return <RouteComponent {...routeProps} />;
          }
        } else {
          // TODO: show the loading screen here
        }
      }}
    />
  );
};

export default PrivateRoute;
