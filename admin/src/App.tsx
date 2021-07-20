// import Console from "./Console";
import PrivateRoute from "components/PrivateRoute";
import { AdminProvider, AuthProvider, BusinessProvider } from "contexts";
import React from "react";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import Dashboard from "views/dashboard";
import GetCard from "views/getCard";
import GettingStarted from "views/gettingStarted";
import Login from "views/login";
import SignUpBusinessWebflow from "views/signUpBusinessWebflow";

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
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
              <Route exact path="/login" component={Login} />
              <Route exact path="/signup" component={SignUpBusinessWebflow} />
              <Route exact path="/getcard" component={GetCard} />
            </Switch>
          </BusinessProvider>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
