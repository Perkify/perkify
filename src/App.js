import { AuthProvider } from "./Auth";
import {BrowserRouter as Router, Switch, Route, useParams} from "react-router-dom";
import Home from './Home';
import React from "react";
import Console from "./Console";
import Login from "./Login";
import SignUp from "./SignUp";
import PrivateRoute from "./PrivateRoute";
import DashBoard from "./DashBoard";
import ManagePeople from "./ManagePeople";
import ManageGroups from "./ManageGroups";
import createGroup from "./CreateGroup";
import GettingStarted from "./gettingStarted";

function App() {
  return (
    <AuthProvider>
     <Router>
       <Switch>
         <Route exact={true} path="/">
           <Home />
         </Route>
         <PrivateRoute exact path="/console" component={Console} />
         <PrivateRoute exact path="/dashboard" component={DashBoard} />
         <PrivateRoute exact path="/people" component={ManagePeople} />
         <PrivateRoute exact path="/groups" component={ManageGroups} />
         <PrivateRoute exact path="/group/:id" component={ManageGroups} />
         <PrivateRoute exact path="/create/group" component={createGroup} />
         <PrivateRoute exact path="/gettingStarted" component={GettingStarted} />
         <Route exact path="/login" component={Login} />
         <Route exact path="/signup" component={SignUp} />
       </Switch>
     </Router>
    </AuthProvider>
  );
}

export default App;
