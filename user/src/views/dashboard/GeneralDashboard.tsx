import { Box, Grid, Typography } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CircularProgress from '@material-ui/core/CircularProgress';
import { green } from '@material-ui/core/colors';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import withStyles from '@material-ui/core/styles/withStyles';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import { AuthContext, BusinessContext } from 'contexts';
import React, { useContext } from 'react';
import { allPerksDict } from 'shared';

const useStyles = makeStyles((theme) => ({
  root: { minHeight: '100vh' },
  details: {
    color: '#ABABAB',
  },
  perkContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  perkCard: {
    margin: theme.spacing(4),
    width: '200px',
    height: '200px',
    boxShadow: '0px 9px 45px 1px rgba(0,0,0,0.1)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: theme.transitions.create(['box-shadow'], {
      duration: theme.transitions.duration.complex,
    }),
    '&:hover': {
      boxShadow: '0px 18px 90px 1px rgba(0,0,0,0.2)',
    },
  },
}));

const PerkCard = withStyles((theme) => ({
  root: {
    margin: theme.spacing(4),
    width: '200px',
    height: '200px',
    boxShadow: '0px 9px 45px 1px rgba(0,0,0,0.1)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transform: 'scale(1) !important',
    transition: `${theme.transitions.create(['box-shadow', 'transform'], {
      duration: theme.transitions.duration.complex,
    })} !important`,
    '&:hover': {
      boxShadow: '0px 12px 60px 1px rgba(0,0,0,0.2)',
      transform: 'scale(1.05) !important',
    },
  },
}))(Paper);

const GeneralDashboard = () => {
  const { currentUser, employee, loadingAuthState } = useContext(AuthContext);
  const { business } = useContext(BusinessContext);

  const classes = useStyles();

  const detailsList = (listObject) => {
    return listObject.map((pair) => (
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

  const perksList = () => {
    let increasingDelay = 0;
    if (business.groups) {
      return business.groups[employee.group].map((perk) => {
        increasingDelay += 300;
        // TODO: this is preferred:
        // (require(`images/perkLogos/${allPerksDict[perk].Img}`));
        return (
          <Grow in={true} timeout={increasingDelay}>
            <PerkCard>
              <CheckCircleOutlineIcon
                style={{
                  fontSize: 32,
                  color: green[400],
                  position: 'absolute',
                  right: '0',
                  top: '0',
                  margin: '18px',
                }}
              />
              <Avatar
                src={`${process.env.PUBLIC_URL}/perkLogos/${allPerksDict[perk].Img}`}
                alt={perk}
                style={{ height: '70px', width: '70px' }}
              />
              <Typography variant="body1">
                <Box fontWeight={600} mt={2}>
                  {perk}
                </Box>
              </Typography>
            </PerkCard>
          </Grow>
        );
      });
    } else {
      return <CircularProgress />;
    }
  };

  if (!loadingAuthState)
    return (
      <Grid container spacing={3} className={classes.root}>
        <Grid item xs={12} md={8} style={{ padding: '10% 5% 5% 5%' }}>
          <Typography gutterBottom variant="h3" component="h1">
            <Box fontWeight="bold">Hi {employee?.firstName},</Box>
          </Typography>
          <Typography gutterBottom variant="h5" component="h1">
            <Box fontWeight={700}>Your perks from {business?.name}</Box>
          </Typography>
          <div className={classes.perkContainer}>{perksList()}</div>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            style={{
              height: '95%',
              margin: '5%',
              backgroundColor: '#F6F8FA', //#e6edff
            }}
            elevation={0}
          >
            <Grid
              container
              spacing={3}
              direction="column"
              alignItems="center"
              justify="center"
              style={{ height: '100%', padding: '0 15%' }}
            >
              <Card
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  height: '250px',
                  background:
                    'linear-gradient(112.03deg, #C69DFF 0%, #4F76FF 100%)',
                }}
                elevation={3}
              ></Card>
              <Grid
                container
                spacing={1}
                style={{ width: '100%', paddingTop: '40px' }}
              >
                <Grid item xs={12}>
                  <Typography gutterBottom variant="h5" component="h2">
                    <Box fontWeight="bold">Card Info</Box>
                  </Typography>
                </Grid>
                {detailsList([
                  {
                    name: 'Card Number',
                    value: `${employee.card.number.substring(
                      0,
                      4
                    )} ${employee.card.number.substring(
                      4,
                      8
                    )} ${employee.card.number.substring(
                      8,
                      12
                    )} ${employee.card.number.substring(12, 16)}`,
                  },
                  {
                    name: 'Name on Card',
                    value: `${employee.firstName} ${employee.lastName}`,
                  },
                  {
                    name: 'Expiration Date',
                    value: `${employee.card.exp.month}/${String(
                      employee.card.exp.year
                    ).substring(0, 2)}`,
                  },
                  {
                    name: 'CVC',
                    value: employee.card.cvc,
                  },
                ])}
                <Grid item xs={12} style={{ paddingTop: '40px' }}>
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
