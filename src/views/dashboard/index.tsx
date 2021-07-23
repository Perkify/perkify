import VerticalNav from 'components/VerticalNav';
import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import Billing from 'views/billing';
import CreateGroup from 'views/createGroup';
import ManagePeople from 'views/employees';
import Logout from 'views/logout';
import ManageGroups from 'views/manageGroups';
import GeneralDashboard from './GeneralDashboard';

const Dashboard = () => {
  const { path, url } = useRouteMatch();

  return (
    <VerticalNav>
      <Switch>
        <Route exact path={path} component={GeneralDashboard} />
        <Route path={`${path}/people`} component={ManagePeople} />
        <Route path={`${path}/group/:id`} component={ManageGroups} />
        <Route path={`${path}/create/group`} component={CreateGroup} />
        <Route path={`${path}/logout`} component={Logout} />
        <Route path={`${path}/billing`} component={Billing} />
      </Switch>
    </VerticalNav>
  );
};

export default Dashboard;
