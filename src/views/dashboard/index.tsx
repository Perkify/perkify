import LinearProgress from "@material-ui/core/LinearProgress";
import VerticalNav from "components/VerticalNav";
import { LoadingContext } from "contexts";
import React, { useContext } from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import CreateGroup from "views/createGroup";
import ManagePeople from "views/employees";
import ManageGroups from "views/manageGroups";
import GeneralDashboard from "./GeneralDashboard";

const Dashboard = () => {
  const { path, url } = useRouteMatch();

  const { dashboardLoading, setDashboardLoading } = useContext(LoadingContext);

  return (
    <>
      <LinearProgress
        hidden={!dashboardLoading}
        style={{
          zIndex: 10000,
          height: "6px",
          width: "100%",
          position: "absolute",
        }}
      />
      <VerticalNav>
        <Switch>
          <Route exact path={path} render={(props) => <GeneralDashboard />} />
          <Route path={`${path}/people`} render={(props) => <ManagePeople />} />
          <Route
            path={`${path}/group/:id`}
            render={(props) => <ManageGroups />}
          />
          <Route
            path={`${path}/create/group`}
            render={(props) => <CreateGroup />}
          />
        </Switch>
      </VerticalNav>
    </>
  );
};

export default Dashboard;
