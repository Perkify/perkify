import { Box, Grid, Typography } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import { makeStyles } from '@material-ui/core/styles';
import { AuthContext, BusinessContext } from 'contexts';
import React, { useContext } from 'react';
import Cards from 'react-credit-cards';
import 'react-credit-cards/es/styles-compiled.css';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import PerkInstructions from './PerkInstructions';
import ViewPerks from './ViewPerks';

const useStyles = makeStyles((theme) => ({
  root: { minHeight: '100vh', margin: '0' },
  details: {
    color: '#ABABAB',
  },
  perkContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
}));

const GeneralDashboard = () => {
  const { currentUser, employee, loadingAuthState } = useContext(AuthContext);
  const { business } = useContext(BusinessContext);
  const { path, url } = useRouteMatch();

  const classes = useStyles();

  const detailsList = (listObject: any) => {
    return listObject.map((pair: any) => (
      <React.Fragment key={pair.name}>
        <Grid item xs={6}>
          <Typography variant="body1" className={classes.details}>
            {pair.name}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">{pair.value}</Typography>
        </Grid>
      </React.Fragment>
    ));
  };

  if (!loadingAuthState)
    return (
      <Grid container spacing={3} className={classes.root}>
        <Grid item xs={12} md={8}>
          <Switch>
            <Route
              exact
              path={path}
              render={() => (
                <ViewPerks employee={employee} business={business} />
              )}
            />
            <Route path={`${path}/:perk`} component={PerkInstructions} />
          </Switch>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            style={{
              height: '95%',
              margin: '26px',
              backgroundColor: '#F6F8FA', //#e6edff
              width: '360px',
              float: 'right',
            }}
            elevation={0}
          >
            <Grid
              container
              spacing={3}
              direction="column"
              alignItems="center"
              justify="center"
              style={{
                height: '100%',
                width: '100%',
                padding: '0 23px',
                margin: '0px',
              }}
            >
              <Grid item>
                <Cards
                  cvc={employee.card.cvc}
                  expiry={`${
                    employee.card.exp.month.toString().length === 1 ? '0' : ''
                  }${employee.card.exp.month}/${String(
                    employee.card.exp.year
                  ).substring(2, 4)}`}
                  focused={'number'}
                  name={`${employee.firstName} ${employee.lastName}`}
                  number={employee.card.number}
                />
              </Grid>
              <Grid item>
                <Cards
                  cvc={employee.card.cvc}
                  expiry={`${
                    employee.card.exp.month.toString().length === 1
                      ? '0' + employee.card.exp.month.toString()
                      : employee.card.exp.month
                  }/${String(employee.card.exp.year).substring(0, 2)}`}
                  focused={'cvc'}
                  name={`${employee.firstName} ${employee.lastName}`}
                  number={employee.card.number}
                />
              </Grid>
              <Grid
                container
                spacing={1}
                style={{ width: '290px', padding: '50px 0px' }}
              >
                <Grid item xs={12}>
                  <Typography gutterBottom variant="h5" component="h2">
                    <Box fontWeight="bold">Billing Address</Box>
                  </Typography>
                </Grid>
                {detailsList([
                  {
                    name: 'Line 1',
                    value: employee.card.billing.address.line1,
                  },
                  {
                    name: 'City',
                    value: employee.card.billing.address.city,
                  },
                  {
                    name: 'State',
                    value: employee.card.billing.address.state,
                  },
                  {
                    name: 'Zip',
                    value: employee.card.billing.address.postal_code,
                  },
                ])}
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    );
  // TODO: deal with loading more gracefully
  else return <></>;
};

export default GeneralDashboard;
