import React, { useContext, useEffect, useState } from "react";
import { Route, Redirect } from "react-router-dom";
import { AuthContext } from "./Auth";
import app from "./firebaseapp.js";
import firebase from "firebase/app";
import "firebase/firestore";

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
