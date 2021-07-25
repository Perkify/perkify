import firebase from 'firebase/app';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { PerkifyApi } from 'services';
import app, { auth, db, functions } from '../firebaseApp';

type ContextProps = {
  currentUser: firebase.User | null;
  authenticated: boolean;
  setCurrentUser: any;
  loadingAuthState: boolean;
  admin: any;
  setAdmin: any;
  hasPaymentMethods: boolean;
  setHasPaymentMethods: any;
  customerPortalUrl: string;
};

export const AuthContext = React.createContext<Partial<ContextProps>>({});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null as firebase.User | null);
  const [loadingAuthState, setLoadingAuthState] = useState(true);
  const [admin, setAdmin] = useState({});
  const location = useLocation();
  const history = useHistory();
  const [hasPaymentMethods, setHasPaymentMethods] = useState(false);
  const [customerPortalUrl, setCustomerPortalUrl] = useState('');

  useEffect(() => {
    app.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await db.collection('admins').doc(user.uid).get();
        if (userDoc) {
          setCurrentUser(user);
          const adminData = userDoc.data();
          setAdmin(adminData);

          // check if customer has payment methods
          const customerDoc = await db
            .collection('customers')
            .doc(user.uid)
            .get();
          const customerData = customerDoc.data();
          const cardPaymentMethods = await PerkifyApi.post(
            '/user/stripePaymentMethods',
            {
              customer: customerData.stripeId,
              type: 'card',
            }
          );
          if (cardPaymentMethods.data.data.length > 0) {
            setHasPaymentMethods(true);
          }
          (async () => {
            const functionRef = functions.httpsCallable(
              'ext-firestore-stripe-subscriptions-createPortalLink'
            );
            const { data } = await functionRef({
              returnUrl: window.location.origin,
            });
            setCustomerPortalUrl(data.url);
          })();

          setLoadingAuthState(false);
          if (!location.pathname.includes('dashboard')) {
            history.push('/dashboard');
          }
        } else {
          auth.signOut();
          alert('You do not have a registered admin account');
        }
      }
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
        customerPortalUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
