import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import React from 'react';
import { PerkifyApi } from 'services';

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
}));

const GetCard = () => {
  const classes = useStyles();
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [dob, setDob] = React.useState('');
  const [invalidStep, setInvalidStep] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const formFields = { firstName, lastName, email, dob };

  const submitGetCard = async () => {
    try {
      if (Object.values(formFields).some((fieldprop) => fieldprop === '')) {
        setInvalidStep(true);
        return;
      }
      setInvalidStep(false);

      let dobFormatted = new Date(new Date(dob)).toLocaleDateString();
      const response = await PerkifyApi.post(
        'rest/registerUser',
        JSON.stringify({
          email,
          firstName,
          lastName,
          dob: dobFormatted,
        })
      );
      if (response.status != 200) {
        throw {
          status: response.status,
          reason: response.statusText,
        };
      }
      setSuccess(true);
    } catch (e) {
      alert(JSON.stringify(e));
      setSuccess(false);
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
        {success ? (
          <h1>Success!</h1>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <InputLabel htmlFor="email" className={classes.label}>
                Email
              </InputLabel>
              <BootstrapInput
                placeholder="johnsmith@mybusiness.com"
                id="email"
                variant="outlined"
                onChange={fillTextbox(setEmail)}
                value={email}
                error={email === '' && invalidStep}
                style={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={4}>
              <InputLabel htmlFor="dob" className={classes.label}>
                Date of Birth
              </InputLabel>
              <BootstrapInput
                id="dob"
                type="date"
                style={{ width: '100%' }}
                onChange={fillTextbox(setDob)}
                value={dob}
                error={dob === '' && invalidStep}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <Button
                variant="contained"
                color="primary"
                style={{ width: '100%', height: '60px', textTransform: 'none' }}
                disableElevation={true}
                onClick={submitGetCard}
              >
                Get an Email with your Card
              </Button>
            </Grid>
            <Grid item xs={12} md={12} className={classes.footer}>
              Already logged in once before?
              <a
                href="https://www.getperkify.com/view-my-card"
                className="sign-in"
              >
                &nbsp;Sign In
              </a>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default GetCard;
