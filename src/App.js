import { AuthProvider } from "./Auth";
import {BrowserRouter as Router, Switch, Route, useParams} from "react-router-dom";
import Home from './Home';
import React from "react";
import Console from "./Console";
import PrivateRoute from "./PrivateRoute";
import DashBoard from "./DashBoard";
import ManagePeople from "./ManagePeople";
import ManageGroups from "./ManageGroups";
import createGroup from "./CreateGroup";
import GettingStarted from "./gettingStarted";
import SignIn from "./SignIn";
import SignUpBusinessWebflow from "./SignUpBusinessWebflow";
import GetCard from "./GetCard";

function App() {
  return (
    <AuthProvider>
     <Router>
       <Switch>
         <Route exact={true} path="/">
           <Home />
         </Route>
         <PrivateRoute exact path="/" component={Console} />
         <PrivateRoute exact path="/dashboard" component={DashBoard} />
         <PrivateRoute exact path="/people" component={ManagePeople} />
         <PrivateRoute exact path="/groups" component={ManageGroups} />
         <PrivateRoute exact path="/group/:id" component={ManageGroups} />
         <PrivateRoute exact path="/create/group" component={createGroup} />
         <PrivateRoute exact path="/gettingStarted" component={GettingStarted} />
         <Route exact path="/login" component={SignIn} />
         <Route exact path="/signup" component={SignUpBusinessWebflow} />
         <Route exact path="/getcard" component={GetCard} />
       </Switch>
     </Router>
    </AuthProvider>
  );
}

export default App;
