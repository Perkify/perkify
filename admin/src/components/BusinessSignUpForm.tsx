import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { createStyles, makeStyles, withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import SignUpGraphic from "images/SignUpGraphic.png";
import React from "react";

const BootstrapInput = withStyles((theme) => ({
  root: {
    "label + &": {
      marginTop: theme.spacing(2),
    },
  },
}))(TextField);

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      fontFamily: "Plusjakartadisplay",
    },
    image: {
      backgroundImage: `url(${SignUpGraphic})`,
      backgroundRepeat: "no-repeat",
      backgroundColor: "#5289f2",
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
    content: {
      width: "100%",
      padding: "3% 5%",
    },
    logo: {
      display: "block",
      width: "135px",
      maxHeight: "40px",
    },
    header: {
      marginTop: "0px",
      marginBottom: "0px",
      fontFamily: "Plusjakartadisplay",
      color: "#152c5b",
      fontSize: "40px",
      lineHeight: "54px",
      //       fontWeight: "500",
    },
    label: {
      fontFamily: "Plusjakartadisplay",
      fontSize: "14px",
      color: "#152c5b",
    },
    footer: {
      fontFamily: "Plusjakartadisplay",
      color: "#8a95ad",
      fontSize: "14px",
      textAlign: "center",
    },
  })
);

const BusinessSignUpForm = (props) => {
  const classes = useStyles();

  const fillTextbox = (setFunction) => (event) => {
    setFunction(event.target.value);
  };

  return (
    <Grid container spacing={3} className={classes.root}>
      <Grid item xs={12} sm={12}>
        <TextField
          required
          id="bizName"
          name="Business Name"
          label="Businesss name"
          variant="outlined"
          fullWidth
          autoComplete="given-name"
          onChange={fillTextbox(props.setBusinessName)}
          value={props.businessName}
          error={props.businessName === "" && props.invalidStep}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          required
          id="address1"
          name="address1"
          label="Address line 1"
          variant="outlined"
          fullWidth
          autoComplete="shipping address-line1"
          onChange={fillTextbox(props.setAddress)}
          value={props.address1}
          error={props.address1 === "" && props.invalidStep}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          id="city"
          name="city"
          label="City"
          variant="outlined"
          fullWidth
          autoComplete="shipping address-level2"
          onChange={fillTextbox(props.setCity)}
          value={props.city}
          error={props.city === "" && props.invalidStep}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          id="state"
          name="state"
          label="State (2 letter code)"
          variant="outlined"
          fullWidth
          inputProps={{ maxLength: 2 }}
          onChange={fillTextbox(props.setState)}
          value={props.state}
          error={props.state === "" && props.invalidStep}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          id="zip"
          name="zip"
          label="Zip / Postal code"
          variant="outlined"
          fullWidth
          autoComplete="shipping postal-code"
          onChange={fillTextbox(props.setZip)}
          value={props.zip}
          error={props.zip === "" && props.invalidStep}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          id="phoneNumber"
          name="Phone Number"
          label="Phone Number"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          variant="outlined"
          fullWidth
          autoComplete="phone number"
          onChange={fillTextbox(props.setPhone)}
          value={props.phone}
          error={props.phone === "" && props.invalidStep}
        />
      </Grid>
      <Grid item xs={6} md={6}>
        <Button
          style={{ width: "100%", height: "60px", textTransform: "none" }}
          disableElevation={true}
          onClick={props.backStep}
        >
          Back
        </Button>
      </Grid>
      <Grid item xs={6} md={6}>
        <Button
          variant="contained"
          color="primary"
          style={{ width: "100%", height: "60px", textTransform: "none" }}
          disableElevation={true}
          onClick={() => props.nextStep(props.nextReady)}
        >
          Create Account
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

export default BusinessSignUpForm;
