import { AuthContext } from 'contexts';
import React, { useContext } from 'react';
import { Redirect, Route } from 'react-router-dom';

const PublicRoute = ({ component: RouteComponent, ...rest }) => {
  const { currentUser, loadingAuthState } = useContext(AuthContext);

  return (
    <Route
      {...rest}
      render={(routeProps) =>
        currentUser && !loadingAuthState ? (
          <Redirect to={'/'} />
        ) : (
          <RouteComponent {...routeProps} />
        )
      }
    />
  );
};

export default PublicRoute;
