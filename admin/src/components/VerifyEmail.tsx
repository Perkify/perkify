import Button from '@material-ui/core/Button';
import { ReactComponent as EmailSVG } from 'images/email.svg';
import React from 'react';

const VerifyEmail = ({ email, newUser }) => {
  const resendVerificationEmail = async () => {
    try {
      await newUser.sendEmailVerification({
        url:
          process.env.REACT_APP_FIREBASE_ENVIRONMENT == 'production'
            ? 'https://admin.getperkify.com/login'
            : process.env.REACT_APP_FIREBASE_ENVIRONMENT == 'staging'
            ? 'https://admin.dev.getperkify.com/login'
            : 'http://localhost:3000/login',
      });
    } catch (e) {
      alert(e);
    }
  };

  return (
    <div style={{ padding: '5%', width: '80%', textAlign: 'center' }}>
      <EmailSVG width="200" height="200" />
      <h1>Please verify your email</h1>
      <h2>You're almost there!</h2>
      <p>
        We sent an email to {email}. Click on the link to complete your signup.
      </p>
      <Button
        variant="contained"
        color="primary"
        style={{ width: '50%', height: '60px', textTransform: 'none' }}
        disableElevation={true}
        onClick={resendVerificationEmail}
      >
        Resend Verification
      </Button>
    </div>
  );
};

export default VerifyEmail;
