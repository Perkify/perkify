import { AuthProvider } from "./Auth";
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import Home from './Home';
import React from "react";
import Console from "./Console";
import Login from "./Login";
import SignUp from "./SignUp";
import PrivateRoute from "./PrivateRoute";

function App() {
  return (
    <AuthProvider>
     <Router>
       <Switch>
         <Route exact={true} path="/">
           <Home />
         </Route>
         <PrivateRoute exact path="/console" component={Console} />
         <Route exact path="/login" component={Login} />
         <Route exact path="/signup" component={SignUp} />
       </Switch>
     </Router>
    </AuthProvider>
  );
}

export default App;
