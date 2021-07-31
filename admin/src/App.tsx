// import Console from "./Console";
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
import GettingStarted from 'views/gettingStarted';
import Login from 'views/login';
import SignUpBusinessWebflow from 'views/signUpBusinessWebflow';

function App() {
  return (
    <Router>
      <LoadingProvider>
        <AuthProvider>
          <BusinessProvider>
            <Switch>
              <Route exact path="/">
                <Redirect to="/dashboard" />
              </Route>
              <PrivateRoute path="/dashboard" component={Dashboard} />
              <PrivateRoute
                exact
                path="/gettingStarted"
                component={GettingStarted}
              />
              <PublicRoute exact path="/login" component={Login} />
              <Route exact path="/signup" component={SignUpBusinessWebflow} />
            </Switch>
          </BusinessProvider>
        </AuthProvider>
      </LoadingProvider>
    </Router>
  );
}

export default App;
