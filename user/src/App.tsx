import PrivateRoute from "components/PrivateRoute";
import PublicRoute from "components/PublicRoute";
import { AuthProvider } from "contexts";
import React from "react";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import Dashboard from "views/dashboard";
import Login from "views/login";
import GettingStarted from "views/gettingStarted";

function App() {
  return (
    <Router>
      <AuthProvider>
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
        </Switch>
      </AuthProvider>
    </Router>
  );
}

export default App;
