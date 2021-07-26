import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import { createStyles, makeStyles, withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import SignUpGraphic from 'images/SignUpGraphic.png';
import React from 'react';

const BootstrapInput = withStyles((theme) => ({
  root: {
    'label + &': {
      marginTop: theme.spacing(2),
    },
  },
}))(TextField);

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      fontFamily: 'Plusjakartadisplay',
    },
    image: {
      backgroundImage: `url(${SignUpGraphic})`,
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#5289f2',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
    content: {
      width: '100%',
      padding: '3% 5%',
    },
    logo: {
      display: 'block',
      width: '135px',
      maxHeight: '40px',
    },
    header: {
      marginTop: '0px',
      marginBottom: '0px',
      fontFamily: 'Plusjakartadisplay',
      color: '#152c5b',
      fontSize: '40px',
      lineHeight: '54px',
      //       fontWeight: "500",
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
  })
);

const AdminSignUpForm = (props) => {
  const classes = useStyles();

  const fillTextbox = (setFunction) => (event) => {
    setFunction(event.target.value);
  };

  return (
    <Grid container spacing={3} className={classes.root}>
      <Grid item xs={12} md={6}>
        <InputLabel htmlFor="firstName" className={classes.label}>
          First Name
        </InputLabel>
        <BootstrapInput
          placeholder="John"
          id="firstName"
          variant="outlined"
          style={{ width: '100%' }}
          onChange={fillTextbox(props.setFirstName)}
          value={props.firstName}
          error={props.firstName === '' && props.invalidStep}
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
          onChange={fillTextbox(props.setLastName)}
          value={props.lastName}
          error={props.lastName === '' && props.invalidStep}
        />
      </Grid>
      <Grid item xs={12} md={12}>
        <InputLabel htmlFor="email" className={classes.label}>
          Email
        </InputLabel>
        <BootstrapInput
          placeholder="johnsmith@mybusiness.com"
          id="email"
          variant="outlined"
          onChange={fillTextbox(props.setEmail)}
          value={props.email}
          error={props.email === '' && props.invalidStep}
          style={{ width: '100%' }}
        />
      </Grid>
      <Grid item xs={12} md={12}>
        <InputLabel htmlFor="pass" className={classes.label}>
          Password
        </InputLabel>
        <BootstrapInput
          placeholder="enter your password"
          id="pass"
          type="password"
          variant="outlined"
          style={{ width: '100%' }}
          onChange={fillTextbox(props.setPassword)}
          value={props.password}
          error={props.password === '' && props.invalidStep}
        />
      </Grid>
      <Grid item xs={12} md={12}>
        <Button
          variant="contained"
          color="primary"
          style={{ width: '100%', height: '60px', textTransform: 'none' }}
          disableElevation={true}
          onClick={() => props.nextStep(props.nextReady)}
        >
          Next
        </Button>
      </Grid>
      <Grid item xs={12} md={12} className={classes.footer}>
        Already have an account?
        <a href="/login" className="sign-in">
          &nbsp;Sign In
        </a>
      </Grid>
    </Grid>
  );
};

export default AdminSignUpForm;
