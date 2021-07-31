import LinearProgress from '@material-ui/core/LinearProgress';
import PrivateRoute from 'components/PrivateRoute';
import PublicRoute from 'components/PublicRoute';
import { LoadingContext } from 'contexts';
import React, { useContext } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import Dashboard from 'views/dashboard';
import GettingStarted from 'views/gettingStarted';
import Login from 'views/login';
import SignUpBusinessWebflow from 'views/signUpBusinessWebflow';

function App() {
  const { dashboardLoading } = useContext(LoadingContext);

  return (
    <>
      <LinearProgress
        hidden={!dashboardLoading}
        style={{
          zIndex: 10000,
          height: '6px',
          width: '100%',
          position: 'absolute',
        }}
      />
      <Switch>
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>
        <PrivateRoute path="/dashboard" component={Dashboard} />
        <PrivateRoute exact path="/gettingStarted" component={GettingStarted} />
        <PublicRoute exact path="/login" component={Login} />
        <Route exact path="/signup" component={SignUpBusinessWebflow} />
      </Switch>
    </>
  );
}

export default App;
