import VerticalNav from 'components/VerticalNav';
import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import Logout from 'views/logout';
import GeneralDashboard from './GeneralDashboard';

const Dashboard = () => {
  const { path, url } = useRouteMatch();

  return (
    <VerticalNav>
      <Switch>
        <Route exact path={path} component={GeneralDashboard} />
        <Route exact path={`${path}/logout`} component={Logout} />
      </Switch>
    </VerticalNav>
  );
};

export default Dashboard;
