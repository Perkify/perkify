import { LoadingContext } from 'contexts';
import firebase from 'firebase/app';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { PerkifyApi } from 'services';
import app, { auth, db } from '../firebaseApp';

type ContextProps = {
  currentUser: firebase.User | null;
  authenticated: boolean;
  setCurrentUser: any;
  loadingAuthState: boolean;
  admin: any;
  setAdmin: any;
  hasPaymentMethods: boolean;
  setHasPaymentMethods: any;
};

export const AuthContext = React.createContext<Partial<ContextProps>>({});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null as firebase.User | null);
  const [loadingAuthState, setLoadingAuthState] = useState(true);
  const [admin, setAdmin] = useState({});
  const location = useLocation();
  const history = useHistory();
  const [hasPaymentMethods, setHasPaymentMethods] = useState(null);

  const { setDashboardLoading } = useContext(LoadingContext);

  useEffect(() => {
    setDashboardLoading(true);
    app.auth().onAuthStateChanged(async (user) => {
      setDashboardLoading(true);
      if (user) {
        const userDoc = await db.collection('admins').doc(user.uid).get();
        if (userDoc) {
          setCurrentUser(user);
          const adminData = userDoc.data();
          setAdmin(adminData);

          const bearerToken = await user.getIdToken();

          setDashboardLoading(false);

          // check if customer has payment methods
          const cardPaymentMethods = await PerkifyApi.get(
            '/user/auth/stripePaymentMethods',
            {
              headers: {
                Authorization: `Bearer ${bearerToken}`,
                'Content-Type': 'application/json',
              },
            }
          );
          setHasPaymentMethods(cardPaymentMethods.data.data.length > 0);
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
        hasPaymentMethods,
        setHasPaymentMethods,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
