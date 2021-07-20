import VerticalNav from "components/VerticalNav";
import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import CreateGroup from "views/createGroup";
import ManagePeople from "views/employees";
import ManageGroups from "views/manageGroups";
import GeneralDashboard from "./GeneralDashboard";
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';


const useStyles = makeStyles({
  root: {
    width: '100%',
  },
});


const Dashboard = () => {
  const { path, url } = useRouteMatch();

  const classes = useStyles();
  const [progress, setProgress] = React.useState(0);
  const [progressHidden, setHidden] = React.useState(false);


  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 99) {
          return 99;
        }
        const diff = Math.random() * 20;
        return Math.min(oldProgress + diff, 99);
      });
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  function deleteLoadingBar(){
    setProgress(100)
    setHidden(true)
  }

  function startLoadingBar(){
    setProgress(0)
    setHidden(false)
  }

  return (
    <>
    <LinearProgress variant="determinate" value={progress} hidden={progressHidden}/>
    <VerticalNav>
      <Switch>
        <Route exact path={path} render={(props) => (<GeneralDashboard doneLoading={deleteLoadingBar} startLoading={startLoadingBar}/>)} />
        <Route path={`${path}/people`} render={(props) => (<ManagePeople doneLoading={deleteLoadingBar} startLoading={startLoadingBar}/>)} />
        <Route path={`${path}/group/:id`} render={(props) => (<ManageGroups doneLoading={deleteLoadingBar} startLoading={startLoadingBar}/>)} />
        <Route path={`${path}/create/group`} render={(props) => (<CreateGroup doneLoading={deleteLoadingBar} startLoading={startLoadingBar}/>)} />
      </Switch>
      
    </VerticalNav>
    </>
  );
};

export default Dashboard;
