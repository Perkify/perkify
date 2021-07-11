import { AuthProvider } from "./contexts/Auth";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "views/home";
import React from "react";
// import Console from "./Console";
import PrivateRoute from "components/PrivateRoute";
import ManagePeople from "views/employees";
import ManageGroups from "views/manageGroups";
import createGroup from "views/createGroup";
import GettingStarted from "views/gettingStarted";
import Login from "views/login";
import SignUpBusinessWebflow from "views/signUpBusinessWebflow";
import GetCard from "views/getCard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          <Route exact={true} path="/">
            <Home />
          </Route>
          {/* <PrivateRoute exact path="/" component={Console} /> */}
          <PrivateRoute exact path="/people" component={ManagePeople} />
          <PrivateRoute exact path="/groups" component={ManageGroups} />
          <PrivateRoute exact path="/group/:id" component={ManageGroups} />
          <PrivateRoute exact path="/create/group" component={createGroup} />
          <PrivateRoute
            exact
            path="/gettingStarted"
            component={GettingStarted}
          />
          <Route exact path="/login" component={Login} />
          {/* <Route exact path="/sigin" component={Login} /> */}
          <Route exact path="/signup" component={SignUpBusinessWebflow} />
          <Route exact path="/getcard" component={GetCard} />
        </Switch>
      </Router>
    </AuthProvider>
  );
}

export default App;
