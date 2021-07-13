// import Console from "./Console";
import PrivateRoute from "components/PrivateRoute";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Dashboard from "views/dashboard";
import GetCard from "views/getCard";
import GettingStarted from "views/gettingStarted";
import Login from "views/login";
import SignUpBusinessWebflow from "views/signUpBusinessWebflow";
import { AuthProvider } from "./contexts/Auth";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Switch>
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
      </Router>
    </AuthProvider>
  );
}

export default App;
