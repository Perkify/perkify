import {
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  Theme,
  Typography,
} from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import { createStyles, makeStyles } from '@material-ui/styles';
import Header from 'components/Header';
import React from 'react';

const SectionHeading = ({ title }: { title: string }) => {
  return (
    <>
      <Typography
        gutterBottom
        variant="button"
        style={{ display: 'inline-block' }}
      >
        {title}
      </Typography>
      <Divider style={{ marginBottom: '20px' }} />
    </>
  );
};

const useDisplayCardPaymentMethodsStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'center',
      '& > *': {
        // flex: 1,
        '&:not(:first-child)': {
          marginLeft: '10px',
        },
      },
    },
    title: {
      flex: '1 1 auto',
      marginLeft: '10px',
    },
  })
);

const DisplayCardPaymentMethod = () => {
  const classes = useDisplayCardPaymentMethodsStyles();

  return (
    <>
      <Grid container>
        <Grid item xs={4}>
          <div className={classes.root}>
            <img
              style={{ height: 25 }}
              src="/credit-card-payment-icons/visa.svg"
            />
            <Typography variant="body1">&bull;&bull;&bull;&bull;</Typography>
            <Typography variant="body1">4242</Typography>
            <Chip label="Default" style={{ height: 20 }} />
          </div>
        </Grid>

        <Grid item xs={4}>
          <div className={classes.root}>
            <Typography variant="body1">Expires 04/2024</Typography>
            <IconButton
              aria-label="clear"
              style={{ margin: 0, padding: 0, marginLeft: '40px' }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </div>
        </Grid>
      </Grid>
      <Button
        variant="text"
        style={{ padding: 0, margin: '20px 0 0 0', textTransform: 'none' }}
      >
        <Typography variant="body1" style={{ color: 'grey' }}>
          + Add payment method
        </Typography>
      </Button>
    </>
  );
};

const useBillingPageStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      maxWidth: '800px',
    },
    title: {
      flex: '1 1 auto',
      marginLeft: '10px',
    },
  })
);

const Billing = () => {
  const classes = useBillingPageStyles();
  // const history = useHistory();
  // const { currentUser } = useContext(AuthContext);
  // const { dashboardLoading, setDashboardLoading, freezeNav, setFreezeNav } =
  //   useContext(LoadingContext);

  return (
    <div className={classes.root}>
      <Header title="Billing" crumbs={['Dashboard', 'Account', 'Billing']} />

      <SectionHeading title="PAYMENT METHOD" />
      <DisplayCardPaymentMethod />

      <SectionHeading title="CURRENT PLAN" />

      {/* <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        }}
      /> */}
      {/* <p>Redirecting you to the billing portal...</p> */}
    </div>
  );
};

export default Billing;
