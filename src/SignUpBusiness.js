import React, {useContext} from "react";
import Grid from '@material-ui/core/Grid';
import {makeStyles} from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import {ReactComponent as EmployeeSVG} from './Images/check.svg';
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Button from "@material-ui/core/Button";
import BusinessForm from "./Components/BusinessForm";
import AdminForm from "./Components/AdminForm";
import VerifyEmail from "./Components/VerifyEmail";
import {act} from "@testing-library/react";
import app from "./firebaseapp";
import {AuthContext} from "./Auth";

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
    },
    image: {
        backgroundImage: 'url(https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#5289f2',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    },
    paper: {
        margin: theme.spacing(16, 8),
        display: 'flex',
        flexDirection: 'column'
    },
    button: {
        marginTop: "20px"
    }
}));

const steps = ['Admin info', 'Verify Email', 'Business details'];

const SignUpBusiness = () => {
    const classes = useStyles();

    const {currentUser} = useContext(AuthContext);

    const [activeStep, setActiveStep] = React.useState(0);
    const [invalidStep, setInvalidStep] = React.useState(false);

    const [firstName, setFirstName] = React.useState("");
    const [lastName, setLastName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [dob, setDob] = React.useState("");
    const AdminFormSetProps = {setFirstName,setLastName,setEmail,setPassword,setDob};
    const AdminFormProps = {firstName,lastName,email,password,dob};

    const [businessName, setBusinessName] = React.useState("");
    const [address, setAddress] = React.useState("");
    const [city, setCity] = React.useState("");
    const [state, setState] = React.useState("");
    const [zip, setZip] = React.useState("");
    const [country, setCountry] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const BusinessFormSetProps = {setBusinessName,setAddress,setCity,setState,setZip,setCountry,setPhone};
    const BusinessFormProps = {businessName,address,city,state,zip,country,phone};

    const verifyNextStep = (step) => {
        switch(step) {
            case 0:
                if (Object.values(AdminFormProps).some((fieldprop) => fieldprop===""))
                    return false;
                return true;
            case 1:
                return true;
                if(currentUser)
                    return currentUser.emailVerified;
                return false;
            case 2:
                if (Object.values(BusinessFormProps).some((fieldprop) => fieldprop===""))
                    return false;
                return true;
        }
    }

    const processNextStep = async (step) => {
       if(verifyNextStep(step)===false)
           return false;
       switch(step) {
          case 0:
              /*
              try {
                  await app.auth().createUserWithEmailAndPassword(email, password);
                  await app.auth().create
              } catch (error) {
                  alert(error);
                  return false;
              }

               */
              return true;
           case 1:
              return true;
           case 2:
              return true;
       }
    }

    const handleNext = async () => {
        if (await processNextStep(activeStep)){
            setInvalidStep(false);
            setActiveStep(activeStep + 1);
        }
        else{
            setInvalidStep(true);
        }
    };

    const handleBack = () => {
        setActiveStep(activeStep - 1);
    };

    function getStepContent(step) {
        switch (step) {
            case 0:
                return <AdminForm {...AdminFormSetProps} {...AdminFormProps} invalidStep={invalidStep} />;
            case 1:
                return <VerifyEmail/>
            case 2:
                return <BusinessForm {...BusinessFormSetProps} {...BusinessFormProps} invalidStep={invalidStep}/>;
            default:
                throw new Error('Unknown step');
        }
    }

    return (
        <Grid container component="main" className={classes.root}>
            <Grid item xs={false} sm={false} md={5} className={classes.image}>

            </Grid>
            <Grid item xs={12} sm={12} md={7} >
                <div className={classes.paper} >
                <Typography component="h1" variant="h4" style={{fontWeight:600}} >
                    Sign your business up for Perkify
                </Typography>
                <Stepper activeStep={activeStep} style={{paddingLeft:"0",width:"80%"}}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <React.Fragment>
                    {getStepContent(activeStep)}
                    <div className={classes.buttons}>
                        {activeStep !== 0 && (
                            <Button onClick={handleBack} className={classes.button}>
                                Back
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleNext}
                            className={classes.button}
                            disabled={!verifyNextStep(activeStep)}
                        >
                            {activeStep === steps.length - 1 ? 'Create Account' : 'Next'}
                        </Button>
                    </div>
                </React.Fragment>
                </div>
            </Grid>
        </Grid>
    );
};

export default SignUpBusiness;
