import { AuthContext } from "contexts/Auth";
import "firebase/firestore";
import app from "firebaseApp";
import React, { useContext, useEffect } from "react";
import { Redirect, Route } from "react-router-dom";

const PrivateRoute = ({ component: RouteComponent, ...rest }) => {
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser && currentUser.emailVerified === false) {
      alert("Please verify your email!");
      app.auth().signOut();
    }
  }, [currentUser]);

  return (
    <Route
      {...rest}
      render={(routeProps) =>
        !!currentUser ? (
          <RouteComponent {...routeProps} />
        ) : (
          <Redirect to={"/login"} />
        )
      }
    />
  );
};

export default PrivateRoute;
