import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { ReactComponent as GettingStartedImage } from 'images/undraw_security_o890.svg';
import React from 'react';

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
  header: {
    textAlign: 'center',
    fontSize: '28px',
    color: '#152c5b',
    marginBottom: '0px',
  },
}));

const EmailInput = ({ setEmail }) => {
  const classes = useStyles();
  const [email, setLocalEmail] = React.useState('');
  const [invalidStep, setInvalidStep] = React.useState(false);
  const formFields = { email };

  const submitGetCard = async () => {
    setEmail(email);
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
        <Card
          style={{
            minHeight: '600px',
            width: '50vw',
            backgroundColor: '#F6F8FA',
          }}
          elevation={0}
        >
          <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justify="center"
            style={{ height: '100%', padding: '10%' }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} style={{ textAlign: 'center' }}>
                <GettingStartedImage
                  style={{ height: '200px', width: 'auto' }}
                />
              </Grid>
              <Grid item xs={12}>
                <p className={classes.footer}>
                  Please enter in your email, so we can confirm your identity.
                </p>
              </Grid>
              <Grid item xs={12}>
                <InputLabel htmlFor="firstName" className={classes.label}>
                  Email
                </InputLabel>
                <BootstrapInput
                  placeholder="Enter Email"
                  id="email"
                  variant="outlined"
                  style={{ width: '100%' }}
                  onChange={fillTextbox(setLocalEmail)}
                  value={email}
                  error={email === '' && invalidStep}
                />
              </Grid>
              <Grid item xs={12} md={12}>
                <Button
                  variant="contained"
                  color="primary"
                  style={{
                    width: '100%',
                    height: '60px',
                    textTransform: 'none',
                  }}
                  disableElevation={true}
                  onClick={submitGetCard}
                >
                  Get Started
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </Container>
  );
};

export default EmailInput;
