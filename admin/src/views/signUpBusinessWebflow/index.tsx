import Grid from '@material-ui/core/Grid';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import { createStyles, makeStyles, withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import AdminSignUpForm from 'components/AdminSignUpForm';
import BusinessSignUpForm from 'components/BusinessSignUpForm';
import VerifyEmail from 'components/VerifyEmail';
import firebase from 'firebase/app';
import app from 'firebaseApp';
import logo from 'images/logo.png';
import SignUpGraphic from 'images/SignUpGraphic.png';
import React from 'react';
import { PerkifyApi } from 'services';

const crypto = require('crypto');

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
      height: '100vh',
      fontFamily: 'Plusjakartadisplay',
      backgroundColor: 'white',
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
  })
);

const steps = ['Admin info', 'Business details', 'Verify Email'];

const SignUpBusinessWebflow = () => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const [invalidStep, setInvalidStep] = React.useState(false);

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const AdminFormSetProps = {
    setFirstName,
    setLastName,
    setEmail,
    setPassword,
  };
  const AdminFormProps = { firstName, lastName, email, password };

  const [businessName, setBusinessName] = React.useState('');
  const [line1, setAddress] = React.useState('');
  const [city, setCity] = React.useState('');
  const [state, setState] = React.useState('');
  const [postalCode, setPostalCode] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const BusinessFormSetProps = {
    setBusinessName,
    setAddress,
    setCity,
    setState,
    setPostalCode,
    setPhone,
  };
  const BusinessFormProps = {
    businessName,
    line1,
    city,
    state,
    postalCode,
    phone,
  };

  const [newUser, setNewUser] = React.useState<firebase.User>(
    null as firebase.User | null
  );

  const processStep = async (step) => {
    switch (step) {
      case 0:
        return true;
      case 1:
        try {
          await PerkifyApi.post('user/registerAdminAndBusiness', {
            ...AdminFormProps,
            ...BusinessFormProps,
            line2: '',
          });
          const result = await app
            .auth()
            .signInWithEmailAndPassword(email, password);
          setNewUser(result.user);
          await result?.user?.sendEmailVerification({
            url: 'https://app.getperkify.com/login',
          });
          return true;
        } catch (error) {
          alert(error);
          return false;
        }
        return true;
      case 2:
        return true;
    }
  };

  const handleNext = async (validnext) => {
    if (validnext && (await processStep(activeStep))) {
      setInvalidStep(false);
      setActiveStep(activeStep + 1);
    } else {
      setInvalidStep(true);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <AdminSignUpForm
            {...AdminFormSetProps}
            {...AdminFormProps}
            invalidStep={invalidStep}
            nextStep={handleNext}
            nextReady={
              !Object.values(AdminFormProps).some(
                (fieldprop) => fieldprop === ''
              )
            }
          />
        );
      case 1:
        return (
          <BusinessSignUpForm
            {...BusinessFormSetProps}
            {...BusinessFormProps}
            invalidStep={invalidStep}
            backStep={handleBack}
            nextStep={handleNext}
            nextReady={
              !Object.values(BusinessFormProps).some(
                (fieldprop) => fieldprop === ''
              )
            }
          />
        );
      case 2:
        return <VerifyEmail email={email} newUser={newUser} />;
      default:
        throw new Error('Unknown step');
    }
  };

  return (
    <Grid container component="main" className={classes.root}>
      <Grid
        container
        direction="column"
        xs={12}
        sm={12}
        md={6}
        className={classes.content}
      >
        <a href="/" className={classes.logo}>
          <img src={logo} style={{ width: '100%' }} />
        </a>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          style={{ height: '80vh' }}
        >
          <Grid item style={{ marginTop: '90px' }}>
            <h2 className={classes.header}>
              Get your business set up with Perkify
            </h2>
          </Grid>
          <Stepper
            activeStep={activeStep}
            style={{ paddingLeft: '0', width: '90%' }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {getStepContent(activeStep)}
        </Grid>
      </Grid>
      <Grid item xs={false} sm={false} md={6} className={classes.image}></Grid>
    </Grid>
  );
};

export default SignUpBusinessWebflow;
