import firebase from "firebase/app";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import app, { auth, db } from "../firebaseApp";

type ContextProps = {
  currentUser: firebase.User | null;
  authenticated: boolean;
  setCurrentUser: any;
  loadingAuthState: boolean;
  admin: any;
  setAdmin: any;
};

export const AuthContext = React.createContext<Partial<ContextProps>>({});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null as firebase.User | null);
  const [admin, setAdmin] = useState({});
  const [loadingAuthState, setLoadingAuthState] = useState(true);
  const history = useHistory();

  useEffect(() => {
    app.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await db.collection("admins").doc(user.uid).get();
        if (userDoc) {
          setCurrentUser(user);
          const adminData = userDoc.data();
          setAdmin(adminData);
        } else {
          auth.signOut();
          alert("You do not have a registered admin account");
        }
      }
      console.log("Loading auth state complete");
      setLoadingAuthState(false);
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authenticated: currentUser !== null,
        setCurrentUser,
        admin,
        setAdmin,
        loadingAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
