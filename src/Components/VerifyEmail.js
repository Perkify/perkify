import React from "react";
import { ReactComponent as EmailSVG } from "../Images/email.svg";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import app from "../firebaseapp";

const VerifyEmail = ({ email, newUser }) => {
  const resendVerificationEmail = async () => {
    try {
      await newUser.sendEmailVerification({
        url: "https://app.getperkify.com/login",
      });
    } catch (e) {
      alert(e);
    }
  };

  return (
    <div style={{ padding: "5%", width: "80%", textAlign: "center" }}>
      <EmailSVG width="200" height="200" />
      <h1>Please verify your email</h1>
      <h2>You're almost there!</h2>
      <p>
        We sent an email to {email}. Click on the link to complete your signup.
      </p>
      <Button
        variant="contained"
        color="primary"
        style={{ width: "50%", height: "60px", textTransform: "none" }}
        disableElevation={true}
        onClick={resendVerificationEmail}
      >
        Resend Verification
      </Button>
    </div>
  );
};

export default VerifyEmail;
