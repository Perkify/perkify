import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { AuthContext } from 'contexts/Auth';
import { ReactComponent as GettingStartedImage } from 'images/gettingStarted.svg';
import React, { useContext } from 'react';
import { PerkifyApi } from 'services';
import { db } from '../../firebaseApp';

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
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [invalidStep, setInvalidStep] = React.useState(false);
  const { currentUser, setEmployee } = useContext(AuthContext);
  const formFields = { firstName, lastName };

  const submitGetCard = async () => {
    try {
      if (Object.values(formFields).some((fieldprop) => fieldprop === '')) {
        setInvalidStep(true);
        return;
      }
      setInvalidStep(false);

      const bearerToken = await currentUser.getIdToken();
      const response = await PerkifyApi.post(
        'user/auth/registerUser',
        JSON.stringify(formFields),
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status != 200) {
        throw {
          status: response.status,
          reason: response.statusText,
        };
      }

      // should I do this here or elsewhere?
      const userDoc = await db.collection('users').doc(currentUser.email).get();
      const employeeData = userDoc.data();
      setEmployee(employeeData);
    } catch (e) {
      alert(JSON.stringify(e));
    }
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
            <Grid container spacing={3}>
              <Grid item xs={12} style={{ textAlign: 'center' }}>
                <GettingStartedImage
                  style={{ height: '200px', width: 'auto' }}
                />
              </Grid>
              <Grid item xs={12}>
                <p className={classes.header}>One last quick thing</p>
                <p className={classes.footer}>
                  We didnt catch your name yet. Once we get it you'll be ready
                  to redeem your perks!
                </p>
              </Grid>
              <Grid item xs={12} md={6}>
                <InputLabel htmlFor="firstName" className={classes.label}>
                  First Name
                </InputLabel>
                <BootstrapInput
                  placeholder="John"
                  id="firstName"
                  variant="outlined"
                  style={{ width: '100%' }}
                  onChange={fillTextbox(setFirstName)}
                  value={firstName}
                  error={firstName === '' && invalidStep}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <InputLabel htmlFor="lastName" className={classes.label}>
                  Last Name
                </InputLabel>
                <BootstrapInput
                  placeholder="Smith"
                  id="lastName"
                  variant="outlined"
                  style={{ width: '100%' }}
                  onChange={fillTextbox(setLastName)}
                  value={lastName}
                  error={lastName === '' && invalidStep}
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
