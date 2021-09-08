import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from '@material-ui/core';
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
import { Alert } from '@material-ui/lab';
import app from 'firebaseApp';
import React, { useState } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { PerkifyApi } from 'services';

const useStyles = makeStyles((theme) => ({
  loginRoot: {
    height: '100%',
  },
  particles: {
    backgroundColor: theme.palette.primary.main,
    position: 'absolute',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignInSide(props: any) {
  const classes = useStyles();

  const [email, setEmail] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [didResetPass, setDidResetPass] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { user, setUser } = props;
  const history = useHistory();
  const [isForgotPasswordModalVisible, setForgotPasswordModalVisible] =
    useState(false);

  const errorAlert = (error: any) => {
    console.error(error);
    setErrorMessage(error);
    setOpen(true);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    if (isForgotPasswordModalVisible) {
      return;
    }
    setLoading(true);
    try {
      await app.auth().signInWithEmailAndPassword(email, password);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      errorAlert(error.message);
    }
  };

  const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const resetPass = async () => {
    setLoading(true);
    try {
      await PerkifyApi.post(`/rest/admin/${resetEmail}/passwordResetLink`);
      setLoading(false);
      setDidResetPass(true);
    } catch (error) {
      setLoading(false);
      console.log(error);
      errorAlert(JSON.parse(error.response.data?.reasonDetail)[0]?.msg);
    }
  };

  return (
    <div style={{ background: '#5289f2' }}>
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleClose}
          elevation={6}
          variant="filled"
          severity="error"
        >
          {errorMessage}
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
            zIndex: 2000,
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
            <Grid
              container
              item
              xs={false}
              sm={4}
              md={7}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img
                src="/images/undraw_online_payments.svg"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '100px',
                }}
              />
            </Grid>
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
                <Typography component="h1" variant="h5">
                  Perkify Admin Login
                </Typography>
                <Typography component="h3" variant="caption">
                  Enter Perkify credentials to login
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
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {/* <FormControlLabel
                    control={
                      <Checkbox
                        value="remember"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Remember me"
                  /> */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                  >
                    Sign In
                  </Button>
                  <Grid container spacing={0}>
                    {/* <Grid item xs>
                      <Link
                        href="https://www.mcgill.ca/it/stay-safe-online/pw-reset"
                        variant="body2"
                      >
                        Forgot password?
                      </Link>
                    </Grid> */}
                    <Grid item xs={12}>
                      <Link to="/signup" variant="body2" component={RouterLink}>
                        {"Don't have an account? Sign Up"}
                      </Link>
                    </Grid>
                  </Grid>
                  <Grid container spacing={0}>
                    <Grid
                      item
                      xs={12}
                      style={{ textAlign: 'left', float: 'right' }}
                    >
                      <Link
                        component="button"
                        onClick={() => setForgotPasswordModalVisible(true)}
                        style={{
                          textTransform: 'none',
                          paddingTop: '20px',
                          fontSize: '14px',
                        }}
                        color="primary"
                      >
                        Forgot Your Password?
                      </Link>
                    </Grid>
                    {/* <Grid item>
                      <Link href="https://github.com/Ruborcalor/onecard_dashboard">
                        <GitHubIcon style={{ fontSize: "12px" }} />
                        {` Github Repository`}
                      </Link>{" "}
                    </Grid> */}
                  </Grid>
                </form>
              </div>
            </Grid>
          </Grid>
        </Card>
        <Dialog
          open={isForgotPasswordModalVisible}
          onClose={() => setForgotPasswordModalVisible(false)}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">{'Reset Password'}</DialogTitle>
          <DialogContent style={{ width: '400px' }}>
            <DialogContentText>
              {didResetPass ? (
                <div>
                  {'We sent an email to ' +
                    resetEmail +
                    '. Click on the link to reset your password.'}
                </div>
              ) : (
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
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              )}
            </DialogContentText>
            <DialogActions>
              {didResetPass ? (
                <Button
                  onClick={() => {
                    setForgotPasswordModalVisible(false);
                    setDidResetPass(false);
                  }}
                  color="primary"
                >
                  Done
                </Button>
              ) : (
                <div>
                  <Button
                    onClick={() => {
                      setForgotPasswordModalVisible(false);
                    }}
                    color="primary"
                  >
                    Cancel
                  </Button>
                  <Button onClick={resetPass} color="primary">
                    Reset Password
                  </Button>
                </div>
              )}
            </DialogActions>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
