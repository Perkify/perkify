import firebase from 'firebase/app';
import React, { useEffect, useState } from 'react';
import { app, auth, db } from 'services';

type ContextProps = {
  currentUser: firebase.User | null;
  authenticated: boolean;
  setCurrentUser: any;
  loadingAuthState: boolean;
  admin: any;
  setAdmin: any;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthContext = React.createContext<Partial<ContextProps>>({});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState(null as firebase.User | null);
  const [loadingAuthState, setLoadingAuthState] = useState(true);
  const [admin, setAdmin] = useState({});

  useEffect(() => {
    app.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await db.collection('admins').doc(user.uid).get();
        if (userDoc) {
          setCurrentUser(user);
          setAdmin(userDoc.data());
        } else {
          auth.signOut();
          alert('You do not have a registered admin account');
        }
      }
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
        admin,
        setAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
