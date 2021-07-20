import firebase from "firebase/app";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import app from "../firebaseApp";

type ContextProps = {
  currentUser: firebase.User | null;
  authenticated: boolean;
  setCurrentUser: any;
  loadingAuthState: boolean;
};

export const AuthContext = React.createContext<Partial<ContextProps>>({});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null as firebase.User | null);
  const [loadingAuthState, setLoadingAuthState] = useState(true);
  const history = useHistory();

  useEffect(() => {
    app.auth().onAuthStateChanged((user) => {
      // console.log("Updating auth");
      // console.log(currentUser);
      console.log("Loading auth state complete");
      setCurrentUser(user);
      setLoadingAuthState(false);
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authenticated: currentUser !== null,
        setCurrentUser,
        loadingAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
