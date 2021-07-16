import VerticalNav from "components/VerticalNav";
import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import CreateGroup from "views/createGroup";
import ManagePeople from "views/employees";
import Logout from "views/logout";
import ManageGroups from "views/manageGroups";
import Settings from "views/settings";
import GeneralDashboard from "./GeneralDashboard";

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
        <Route path={`${path}/settings`} component={Settings} />
      </Switch>
    </VerticalNav>
  );
};

export default Dashboard;
