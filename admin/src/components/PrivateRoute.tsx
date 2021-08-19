import { AuthContext } from 'contexts/Auth';
import { auth } from 'firebaseApp';
import React, { useContext, useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';

interface PrivateRouteProps {
  component: React.ElementType;
  [key: string]: any;
}

const PrivateRoute = ({
  component: RouteComponent,
  ...rest
}: PrivateRouteProps) => {
  const { currentUser, setCurrentUser, loadingAuthState } =
    useContext(AuthContext);

  useEffect(() => {
    if (currentUser && currentUser.emailVerified === false) {
      auth.signOut();
      setCurrentUser(null);
      alert('Please verify your email!');
    }
  }, [currentUser]);

  return (
    <Route
      {...rest}
      render={(routeProps) =>
        !currentUser && !loadingAuthState ? (
          <Redirect to={'/login'} />
        ) : (
          <RouteComponent {...routeProps} />
        )
      }
    />
  );
};

export default PrivateRoute;
