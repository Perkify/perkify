import { Button, Grid, Theme, Typography } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { createStyles, makeStyles } from '@material-ui/styles';
import { BusinessContext } from 'contexts';
import React, { useContext, useState } from 'react';
import { Subscription } from '../../types/stripeTypes';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

function createData(perkName: string, quantity: number, price: number) {
  return {
    perkName,
    quantity,
    price,
    amount: Math.round(quantity * price * 100) / 100,
  };
}

const rows = [createData('Spotify', 2, 12.99), createData('Hulu', 5, 5.99)];

export default function BasicTable() {
  const classes = useStyles();

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Perk Name</TableCell>
            <TableCell align="right">Quantity</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.perkName}>
              <TableCell component="th" scope="row">
                {row.perkName}
              </TableCell>
              <TableCell align="right">{row.quantity}</TableCell>
              <TableCell align="right">{row.price}</TableCell>
              <TableCell align="right">{row.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const useDisplayCurrentPlanStyles = makeStyles((theme: Theme) =>
  createStyles({
    listContainer: {
      '& > *': {
        '&:not(:first-child)': {
          marginTop: '20px',
        },
      },
    },
  })
);

export const DisplayCurrentPlan = () => {
  const classes = useDisplayCurrentPlanStyles();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { business } = useContext(BusinessContext);
  const [subscriptionObject, setSubscriptionObject] =
    useState<Subscription>(null);

  // useEffect(() => {
  //   if (business) {
  //     console.log(business);
  //     (async () => {
  //       // check if the customer has an existing active subscriptions
  //       console.log('FETCHING SUBSCRIPTION OBJECT');
  //       const subscriptionsSnapshot = await db
  //         .collection('businesses')
  //         .doc(business.businessID)
  //         .collection('subscriptions')
  //         .get();

  //       const subscriptionItem = subscriptionsSnapshot.docs.filter(
  //         (doc) =>
  //           (doc.data() as Subscription).canceled_at == null &&
  //           (doc.data() as Subscription).status == 'active'
  //       )?.[0];

  //       if (subscriptionItem && subscriptionItem.exists) {
  //         const subscriptionObject = subscriptionItem.data() as Subscription;
  //         setSubscriptionObject(subscriptionObject);
  //       }
  //     })();
  //   }
  // }, [business]);

  return (
    <div className={classes.listContainer}>
      {true ? (
        <div>
          <Typography style={{ fontSize: '20px' }}>
            $193.24 per month
          </Typography>
          <Typography>Your plan renews on September 22, 2021</Typography>
          {showBreakdown ? (
            <>
              <div>
                <BasicTable />
              </div>
              <Grid container>
                <Grid item xs={3}>
                  <Button
                    variant="text"
                    disableRipple
                    onClick={() => setShowBreakdown(false)}
                    style={{
                      padding: 0,
                      margin: 0,
                      textTransform: 'none',
                      backgroundColor: 'transparent',
                    }}
                  >
                    <Typography
                      style={{
                        color: 'grey',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <ExpandLessIcon
                        fontSize="small"
                        style={{ marginRight: '5px' }}
                      />
                      Hide Breakdown
                    </Typography>
                  </Button>
                </Grid>
              </Grid>
            </>
          ) : (
            <Grid container>
              <Grid item xs={3}>
                <Button
                  variant="text"
                  disableRipple
                  onClick={() => setShowBreakdown(true)}
                  style={{
                    padding: 0,
                    margin: 0,
                    textTransform: 'none',
                    backgroundColor: 'transparent',
                  }}
                >
                  <Typography
                    style={{
                      color: 'grey',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <ExpandMoreIcon
                      fontSize="small"
                      style={{ marginRight: '5px' }}
                    />
                    Show Breakdown
                  </Typography>
                </Button>
              </Grid>
            </Grid>
          )}
        </div>
      ) : (
        <div>
          <Typography>
            No plan. This business has not created any perk groups yet.
          </Typography>
        </div>
      )}
    </div>
  );
};
