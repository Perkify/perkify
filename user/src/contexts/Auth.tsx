import firebase from 'firebase/app';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { app, auth, db } from 'services';
import EmailInput from '../views/gettingStarted/EmailInput';

type ContextProps = {
  currentUser: firebase.User | null;
  authenticated: boolean;
  setCurrentUser: any;
  loadingAuthState: boolean;
  employee: Employee;
  setEmployee: any;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthContext = React.createContext<Partial<ContextProps>>({});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState(null as firebase.User | null);
  const [employee, setEmployee] = useState<Employee>();
  const [loadingAuthState, setLoadingAuthState] = useState(true);
  const location = useLocation();
  const history = useHistory();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [inputEmail, setEmail] = useState('');

  useEffect(() => {
    if (firebase.auth().isSignInWithEmailLink(location.search)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        if (inputEmail == '') {
          setIsLoggingIn(true);
          return;
        } else {
          email = inputEmail;
        }
      }
      // check if email is registered before signing in?
      firebase
        .auth()
        .signInWithEmailLink(email, location.search)
        .then((result) => {
          // Clear email from storage.
          window.localStorage.removeItem('emailForSignIn');
          setIsLoggingIn(false);
          history.push('/dashboard');
          // should i do:
          // setCurrentUser(result.user);?
        })
        .catch((error) => {
          console.error(error);
          if (error.code === 'auth/invalid-action-code') {
            alert('This sign in link has expired or been used');
            history.push('/login');
          } else alert('an error occurred');
        });
    }
  }, [location, inputEmail]);

  useEffect(() => {
    app.auth().onAuthStateChanged(async (user) => {
      setLoadingAuthState(true);
      if (user) {
        const userDoc = await db
          .collectionGroup('employees')
          .where('employeeID', '==', user.uid)
          .get();
        if (!userDoc.empty) {
          setCurrentUser(user);
          const employeeData = userDoc.docs[0].data();
          setEmployee(employeeData as Employee);
        } else {
          auth.signOut();
          alert('You do not have a registered user account');
        }
      }
      setLoadingAuthState(false);
    });
  }, []);

  return isLoggingIn ? (
    <EmailInput setEmail={setEmail} />
  ) : (
    <AuthContext.Provider
      value={{
        currentUser,
        authenticated: currentUser !== null,
        setCurrentUser,
        employee,
        setEmployee,
        loadingAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
