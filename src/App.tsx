// import Console from "./Console";
import PrivateRoute from "components/PrivateRoute";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import createGroup from "views/createGroup";
import ManagePeople from "views/employees";
import GetCard from "views/getCard";
import GettingStarted from "views/gettingStarted";
import Home from "views/home";
import Login from "views/login";
import ManageGroups from "views/manageGroups";
import SignUpBusinessWebflow from "views/signUpBusinessWebflow";
import { AuthProvider } from "./contexts/Auth";

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
