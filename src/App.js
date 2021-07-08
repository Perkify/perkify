import { AuthProvider } from "./Auth";
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import React from "react";
import Console from "./Console";
import PrivateRoute from "./PrivateRoute";
import SignIn from "./SignIn";
import SignUpBusinessWebflow from "./SignUpBusinessWebflow";
import GetCard from "./GetCard";

function App() {
  return (
    <AuthProvider>
     <Router>
       <Switch>
         <PrivateRoute exact path="/" component={Console} />
         <Route exact path="/login" component={SignIn} />
         <Route exact path="/signup" component={SignUpBusinessWebflow} />
         <Route exact path="/getcard" component={GetCard} />
       </Switch>
     </Router>
    </AuthProvider>
  );
}

export default App;
