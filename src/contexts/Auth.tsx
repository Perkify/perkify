import firebase from "firebase/app";
import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    app.auth().onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoadingAuthState(false);
    });
  }, []);

  if (loadingAuthState) {
    return <>Loading...</>;
  }

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
