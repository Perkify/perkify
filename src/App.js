import { AuthProvider } from "./Auth";
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import Home from './Home';
import React from "react";
import Console from "./Console";
import Login from "./Login";
import SignUp from "./SignUp";
import SignUpForm from "./SignUpForm";
import PrivateRoute from "./PrivateRoute";
import SignIn from "./SignIn";
import SignUpBusiness from "./SignUpBusiness";
import SignUpBusinessWebflow from "./SignUpBusinessWebflow";


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
         <Route exact path="/signupform" component={SignUpForm} />
         <Route exact path="/signin" component={SignIn} />
         <Route exact path="/signupbusiness" component={SignUpBusiness} />
         <Route exact path="/signupbusinessw" component={SignUpBusinessWebflow} />
       </Switch>
     </Router>
    </AuthProvider>
  );
}

export default App;
