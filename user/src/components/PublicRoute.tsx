import { AuthContext } from 'contexts/Auth';
import React, { useContext } from 'react';
import { Redirect, Route } from 'react-router-dom';

interface PublicRouteProps {
  component: React.ElementType;
  [key: string]: any;
}

const PublicRoute = ({
  component: RouteComponent,
  ...rest
}: PublicRouteProps) => {
  const { currentUser, loadingAuthState } = useContext(AuthContext);

  return (
    <Route
      {...rest}
      render={(routeProps) =>
        currentUser && !loadingAuthState ? (
          <Redirect to={'/dashboard'} />
        ) : (
          <RouteComponent {...routeProps} />
        )
      }
    />
  );
};

export default PublicRoute;
