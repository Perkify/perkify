import { Button, Grid, Theme, Typography } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { createStyles, makeStyles } from '@material-ui/styles';
import { BusinessContext } from 'contexts';
import React, { useContext, useState } from 'react';
const useDisplayBillingHistoryStyles = makeStyles((theme: Theme) =>
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

export const DisplayBillingHistory = () => {
  const classes = useDisplayBillingHistoryStyles();
  const [showMore, setShowMore] = useState(false);
  const { business } = useContext(BusinessContext);
  const [payments, setPayments] = useState<any[]>(null);

  // useEffect(() => {
  //   if (business) {
  //     (async () => {
  //       // check if the customer has an existing active subscriptions
  //       const paymentsSnapshot = await db
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

  //         const newRows = subscriptionObject.items
  //           .filter((itemObj) => itemObj.price.id in allPerksByPriceIDDict)
  //           .map((itemObj) => ({
  //             perkName: allPerksByPriceIDDict[itemObj.price.id].Name,
  //             quantity: itemObj.quantity,
  //             price: itemObj.price.unit_amount / 100,
  //             amount: (itemObj.quantity * itemObj.price.unit_amount) / 100,
  //           }));

  //         const subtotal = newRows.reduce((acc, row) => {
  //           return acc + row.amount;
  //         }, 0);

  //         const volumeFee = Math.round(subtotal * 0.1 * 100) / 100;

  //         const cardMaintenanceFee = Math.round(
  //           3.99 *
  //             Object.keys(business.perkGroups).reduce((acc, perkGroupName) => {
  //               return (
  //                 acc + business.perkGroups[perkGroupName].userEmails.length
  //               );
  //             }, 0)
  //         );

  //         const total =
  //           Math.round((subtotal + volumeFee + cardMaintenanceFee) * 100) / 100;

  //         setSubscriptionPrices({
  //           subtotal,
  //           volumeFee,
  //           cardMaintenanceFee,
  //           total,
  //         });

  //         setSubscriptionObject(subscriptionObject);
  //         setRows(newRows);
  //       }
  //     })();
  //   }
  // }, [business]);

  return (
    <div className={classes.listContainer}>
      <Grid container>
        <Grid item xs={3}>
          <Typography
            style={{
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Aug 25, 2021
            <OpenInNewIcon fontSize="small" style={{ marginLeft: '5px' }} />
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography>$23.72</Typography>
        </Grid>
      </Grid>

      <Grid container>
        <Grid item xs={3}>
          <Typography
            style={{
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Aug 24, 2021
            <OpenInNewIcon fontSize="small" style={{ marginLeft: '5px' }} />
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography>$43.22</Typography>
        </Grid>
      </Grid>

      <Grid container>
        <Grid item xs={3}>
          <Button
            variant="text"
            disableRipple
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
              <ExpandMoreIcon fontSize="small" style={{ marginRight: '5px' }} />
              View More
            </Typography>
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};
