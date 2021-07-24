import LinearProgress from '@material-ui/core/LinearProgress';
import VerticalNav from 'components/VerticalNav';
import { LoadingContext } from 'contexts';
import React, { useContext } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import Billing from 'views/billing';
import CreateGroup from 'views/createGroup';
import ManagePeople from 'views/employees';
import Logout from 'views/logout';
import ManageGroups from 'views/manageGroups';
import GeneralDashboard from './GeneralDashboard';

const Dashboard = () => {
  const { path, url } = useRouteMatch();

  const { dashboardLoading, setDashboardLoading } = useContext(LoadingContext);

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
    </>
  );
};

export default Dashboard;
