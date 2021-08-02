import { Snackbar } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CircularProgress from '@material-ui/core/CircularProgress';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
// import axios from "services/api";
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import GitHubIcon from '@material-ui/icons/GitHub';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { Alert } from '@material-ui/lab';
import app, { db } from 'firebaseApp';
import React, { useState } from 'react';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      <Link
        color="inherit"
        href="https://github.com/Ruborcalor/onecard_dashboard"
      >
        <GitHubIcon />
        Github Repository
      </Link>{' '}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  loginRoot: {
    height: '100%',
  },
  particles: {
    backgroundColor: theme.palette.primary.main,
    position: 'absolute',
  },
  image: {
    backgroundImage: 'url(/SignUpGraphic.png)',
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light'
        ? theme.palette.grey[50]
        : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignInSide(props) {
  const classes = useStyles();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSuccess, setOpenSuccess] = React.useState(false);

  const errorAlert = (error) => {
    console.error(error);
    setErrorMessage(error);
    setOpenError(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const userDoc = await db.collection('users').doc(email).get();
      if (!userDoc) {
        throw new Error('Your employer has not signed you up with that email');
      }
      await app.auth().sendSignInLinkToEmail(email, {
        url: `${
          process.env.NODE_ENV == 'development'
            ? 'http://localhost:3001/dashboard'
            : 'https://app.getperkify.com'
        }`,
        handleCodeInApp: true,
      });
      window.localStorage.setItem('emailForSignIn', email);
      setLoading(false);
      setOpenSuccess(true);
    } catch (error) {
      setLoading(false);
      errorAlert(error.message);
    }
  };

  const handleCloseError = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenError(false);
  };

  const handleCloseSuccess = (
    event?: React.SyntheticEvent,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSuccess(false);
  };

  return (
    <>
      {/* <Particles height="100vh" width="100vw" className={classes.particles} /> */}
      <Snackbar
        open={openError}
        autoHideDuration={4000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleCloseError}
          elevation={6}
          variant="filled"
          severity="error"
        >
          {errorMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={openSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
      >
        <Alert onClose={handleCloseSuccess} severity="success">
          Check your email for a link to login!
        </Alert>
      </Snackbar>
      {loading && (
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            height: '100vh',
            width: '100vw',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress color="secondary" style={{ zIndex: 20 }} />
        </div>
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Card
          style={{ height: '600px', width: '60vw', zIndex: 10 }}
          elevation={6}
        >
          <Grid container component="main" className={classes.loginRoot}>
            <CssBaseline />
            <Grid item xs={false} sm={4} md={7} className={classes.image} />
            <Grid
              item
              xs={12}
              sm={8}
              md={5}
              component={Paper}
              elevation={6}
              square
            >
              <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                  <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                  Perkify Dashboard Login
                </Typography>
                <Typography component="h3" variant="caption">
                  Enter perkify credentials to login
                </Typography>
                <form
                  className={classes.form}
                  onSubmit={handleSubmit}
                  noValidate
                >
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                  >
                    Get sign in link
                  </Button>
                </form>
              </div>
            </Grid>
          </Grid>
        </Card>
      </div>
    </>
  );
}
