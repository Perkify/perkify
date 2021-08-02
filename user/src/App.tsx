import PrivateRoute from 'components/PrivateRoute';
import PublicRoute from 'components/PublicRoute';
import { AuthProvider, BusinessProvider, LoadingProvider } from 'contexts';
import React from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import Dashboard from 'views/dashboard';
import Login from 'views/login';

function App() {
  return (
    <Router>
      <LoadingProvider>
        <AuthProvider>
          <BusinessProvider>
            <Switch>
              <Route exact path="/">
                <Redirect to="/login" />
              </Route>
              <PrivateRoute path="/dashboard" component={Dashboard} />
              <PublicRoute exact path="/login" component={Login} />
            </Switch>
          </BusinessProvider>
        </AuthProvider>
      </LoadingProvider>
    </Router>
  );
}

export default App;
