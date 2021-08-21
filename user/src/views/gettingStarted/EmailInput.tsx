import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { AuthContext } from 'contexts/Auth';
import React, { useContext } from 'react';
import { LoadingContext } from '../../contexts';

const BootstrapInput = withStyles((theme) => ({
  root: {
    'label + &': {
      marginTop: theme.spacing(2),
    },
  },
}))(TextField);

const useStyles = makeStyles((theme) => ({
  root: {
    fontFamily: 'Plusjakartadisplay',
    minHeight: '100vh',
  },
  label: {
    fontFamily: 'Plusjakartadisplay',
    fontSize: '14px',
    color: '#152c5b',
  },
  footer: {
    fontFamily: 'Plusjakartadisplay',
    color: '#8a95ad',
    fontSize: '14px',
    textAlign: 'center',
  },
  header: {
    textAlign: 'center',
    fontSize: '28px',
    color: '#152c5b',
    marginBottom: '0px',
  },
}));

const GettingStarted = () => {
  const classes = useStyles();
  const [email, setEmail] = React.useState('');
  const [invalidStep, setInvalidStep] = React.useState(false);
  const { setEmail } = useContext(AuthContext);
  const { dashboardLoading, setDashboardLoading } = useContext(LoadingContext);
  const formFields = { email };

  const submitGetCard = async () => {
    setDashboardLoading(true);
    setEmail(email);
  };

  const fillTextbox = (setFunction) => (event) => {
    setFunction(event.target.value);
  };

  return (
    <Container>
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justify="center"
        className={classes.root}
      >
        <Card
          style={{
            minHeight: '600px',
            width: '50vw',
            backgroundColor: '#F6F8FA',
          }}
          elevation={0}
        >
          <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justify="center"
            style={{ height: '100%', padding: '10%' }}
          >
            <Grid item xs={12}>
              <p className={classes.footer}>
                Please enter in your email, so we can confirm your identity.
              </p>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <InputLabel htmlFor="firstName" className={classes.label}>
                  Email
                </InputLabel>
                <BootstrapInput
                  placeholder="Enter Email"
                  id="email"
                  variant="outlined"
                  style={{ width: '100%' }}
                  onChange={fillTextbox(setEmail)}
                  value={email}
                  error={email === '' && invalidStep}
                />
              </Grid>
              <Grid item xs={12} md={12}>
                <Button
                  variant="contained"
                  color="primary"
                  style={{
                    width: '100%',
                    height: '60px',
                    textTransform: 'none',
                  }}
                  disableElevation={true}
                  onClick={submitGetCard}
                >
                  Get Started
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </Container>
  );
};

export default GettingStarted;
