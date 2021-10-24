import Button from '@material-ui/core/Button';
import firebase from 'firebase/app';
import { ReactComponent as EmailSVG } from 'images/email.svg';
import React from 'react';
import { PerkifyApi } from '../services';

interface VerifyEmailProps {
  email: string;
  newUser: firebase.User;
}

const VerifyEmail = ({ email, newUser }: VerifyEmailProps) => {
  const resendVerificationEmail = async () => {
    try {
      const bearerToken = await newUser.getIdToken();

      // call the api to resend verification email
      await PerkifyApi.post(
        `rest/admin/${email}/emailVerificationLink`,
        {},
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
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
