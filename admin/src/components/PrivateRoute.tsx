import { AuthContext } from "contexts/Auth";
import { auth } from "firebaseApp";
import React, { useContext, useEffect } from "react";
import { Redirect, Route } from "react-router-dom";

const PrivateRoute = ({ component: RouteComponent, ...rest }) => {
  const { currentUser, loadingAuthState } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser && currentUser.emailVerified === false) {
      auth.signOut();
      alert("Please verify your email!");
    }
  }, [currentUser]);

  return (
    <Route
      {...rest}
      render={(routeProps) =>
        !currentUser && !loadingAuthState ? (
          <Redirect to={"/login"} />
        ) : (
          <RouteComponent {...routeProps} />
        )
      }
    />
  );
};

export default PrivateRoute;
