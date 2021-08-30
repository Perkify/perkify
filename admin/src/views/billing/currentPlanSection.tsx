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
import * as dayjs from 'dayjs';
import { db } from 'firebaseApp';
import React, { useContext, useEffect, useState } from 'react';
import { allPerksByPriceIDDict } from 'shared';
import { Subscription } from '../../types/stripeTypes';

interface CostBreakdownRow {
  perkName: string;
  quantity: number;
  price: number;
  amount: number;
}

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

// const rows = [createData('Spotify', 2, 12.99), createData('Hulu', 5, 5.99)];

export default function BasicTable({
  rows,
  subscriptionPrices,
}: {
  rows: CostBreakdownRow[];
  subscriptionPrices: SubscriptionPrices;
}) {
  const classes = useStyles();

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      style={{ border: 'none' }}
    >
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
              <TableCell align="right">{`$${row.price}`}</TableCell>
              <TableCell align="right">{`$${row.amount}`}</TableCell>
            </TableRow>
          ))}

          <TableRow key="subtotal">
            <TableCell
              style={{ border: 'none' }}
              component="th"
              scope="row"
            ></TableCell>
            <TableCell style={{ border: 'none' }} align="right"></TableCell>
            <TableCell
              style={{ border: 'none', fontWeight: 'bold' }}
              align="right"
            >
              Subtotal
            </TableCell>
            <TableCell
              style={{ border: 'none' }}
              align="right"
            >{`$${subscriptionPrices.subtotal}`}</TableCell>
          </TableRow>

          <TableRow key="perkifyVolume">
            <TableCell
              style={{ border: 'none' }}
              component="th"
              scope="row"
            ></TableCell>
            <TableCell style={{ border: 'none' }} align="right"></TableCell>
            <TableCell style={{ border: 'none' }} align="right">
              Perkify Volume Fee
            </TableCell>
            <TableCell
              style={{ border: 'none' }}
              align="right"
            >{`$${subscriptionPrices.volumeFee}`}</TableCell>
          </TableRow>

          <TableRow key="perkifyCardMaintenance">
            <TableCell
              style={{ border: 'none' }}
              component="th"
              scope="row"
            ></TableCell>
            <TableCell style={{ border: 'none' }} align="right"></TableCell>
            <TableCell style={{ border: 'none' }} align="right">
              Perkify Card Maintenance Fee
            </TableCell>
            <TableCell
              style={{ border: 'none' }}
              align="right"
            >{`$${subscriptionPrices.cardMaintenanceFee}`}</TableCell>
          </TableRow>

          <TableRow key="total">
            <TableCell
              style={{ border: 'none' }}
              component="th"
              scope="row"
            ></TableCell>
            <TableCell style={{ border: 'none' }} align="right"></TableCell>
            <TableCell
              style={{ border: 'none', fontWeight: 'bold' }}
              align="right"
            >
              Total
            </TableCell>
            <TableCell
              style={{ border: 'none' }}
              align="right"
            >{`$${subscriptionPrices.total}`}</TableCell>
          </TableRow>
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

interface SubscriptionPrices {
  subtotal: number;
  volumeFee: number;
  cardMaintenanceFee: number;
  total: number;
}

export const DisplayCurrentPlan = () => {
  const classes = useDisplayCurrentPlanStyles();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { business } = useContext(BusinessContext);
  const [subscriptionObject, setSubscriptionObject] =
    useState<Subscription>(null);
  const [rows, setRows] = useState<CostBreakdownRow[]>([]);
  const [subscriptionPrices, setSubscriptionPrices] =
    useState<SubscriptionPrices>(null);

  useEffect(() => {
    if (business) {
      (async () => {
        // check if the customer has an existing active subscriptions
        const subscriptionsSnapshot = await db
          .collection('businesses')
          .doc(business.businessID)
          .collection('subscriptions')
          .get();

        const subscriptionItem = subscriptionsSnapshot.docs.filter(
          (doc) =>
            (doc.data() as Subscription).canceled_at == null &&
            (doc.data() as Subscription).status == 'active'
        )?.[0];

        if (subscriptionItem && subscriptionItem.exists) {
          const subscriptionObject = subscriptionItem.data() as Subscription;

          const newRows = subscriptionObject.items
            .filter((itemObj) => itemObj.price.id in allPerksByPriceIDDict)
            .map((itemObj) => ({
              perkName: allPerksByPriceIDDict[itemObj.price.id].Name,
              quantity: itemObj.quantity,
              price: itemObj.price.unit_amount / 100,
              amount: (itemObj.quantity * itemObj.price.unit_amount) / 100,
            }));

          const subtotal = newRows.reduce((acc, row) => {
            return acc + row.amount;
          }, 0);

          const volumeFee = Math.round(subtotal * 0.1 * 100) / 100;

          const cardMaintenanceFee = Math.round(
            3.99 *
              Object.keys(business.perkGroups).reduce((acc, perkGroupName) => {
                return (
                  acc + business.perkGroups[perkGroupName].userEmails.length
                );
              }, 0)
          );

          const total =
            Math.round((subtotal + volumeFee + cardMaintenanceFee) * 100) / 100;

          setSubscriptionPrices({
            subtotal,
            volumeFee,
            cardMaintenanceFee,
            total,
          });

          setSubscriptionObject(subscriptionObject);
          setRows(newRows);
        }
      })();
    }
  }, [business]);

  return (
    <div className={classes.listContainer}>
      {subscriptionObject && subscriptionPrices ? (
        <>
          <div>
            <Typography style={{ fontSize: '20px' }}>
              {`$${subscriptionPrices.total} per month`}
            </Typography>
            <Typography>{`Your plan renews on ${dayjs
              .unix(subscriptionObject.current_period_end.seconds)
              .format('MMMM DD, YYYY')}`}</Typography>
          </div>
          {showBreakdown ? (
            <>
              <div>
                <BasicTable
                  rows={rows}
                  subscriptionPrices={subscriptionPrices}
                />
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
        </>
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
