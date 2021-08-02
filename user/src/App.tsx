import PrivateRoute from 'components/PrivateRoute';
import PublicRoute from 'components/PublicRoute';
import { AuthProvider, BusinessProvider } from 'contexts';
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

function App() {
  return (
    <Router>
      <AuthProvider>
        <BusinessProvider>
          <Switch>
            <Route exact path="/">
              <Redirect to="/login" />
            </Route>
            <PrivateRoute path="/dashboard" component={Dashboard} />
            <PrivateRoute
              exact
              path="/gettingStarted"
              component={GettingStarted}
            />
            <PublicRoute exact path="/login" component={Login} />
          </Switch>
        </BusinessProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
