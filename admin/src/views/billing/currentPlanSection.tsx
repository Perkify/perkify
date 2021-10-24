import { Button, Grid, Theme, Typography } from '@material-ui/core';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { createStyles, makeStyles } from '@material-ui/styles';
import { BusinessContext } from 'contexts';
import * as dayjs from 'dayjs';
import React, { useContext, useEffect, useState } from 'react';
import { db } from 'services';
import { allPerksByPriceIDDict } from 'shared';
import PriceBreakdownTable from './priceBreakdownTable';
import { SectionHeading } from './sectionHeading';

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

        const staticSubscriptionItem = subscriptionsSnapshot.docs.filter(
          (doc) =>
            (doc.data() as Subscription).canceled_at == null &&
            (doc.data() as Subscription).status == 'active'
        )?.[0];

        if (staticSubscriptionItem) {
          db.collection('businesses')
            .doc(business.businessID)
            .collection('subscriptions')
            .doc(staticSubscriptionItem.id)
            .onSnapshot((subscriptionItem) => {
              if (subscriptionItem && subscriptionItem.exists) {
                const subscriptionObject =
                  subscriptionItem.data() as Subscription;

                const newRows = subscriptionObject.items
                  .filter(
                    (itemObj) => itemObj.price.id in allPerksByPriceIDDict
                  )
                  .map((itemObj) => ({
                    perkName: allPerksByPriceIDDict[itemObj.price.id].Name,
                    quantity: itemObj.quantity,
                    price: allPerksByPriceIDDict[itemObj.price.id].Cost,
                    amount:
                      (itemObj.quantity * itemObj.price.unit_amount) / 100,
                  }))
                  .filter((row) => row.quantity != 0);

                const subtotal = newRows.reduce((acc, row) => {
                  return acc + row.amount;
                }, 0);

                const volumeFee = Math.round(subtotal * 0.1 * 100) / 100;

                const cardMaintenanceFee =
                  Math.round(
                    3.99 *
                      Object.keys(business.perkGroups).reduce(
                        (acc, perkGroupName) => {
                          return (
                            acc +
                            business.perkGroups[perkGroupName].employeeIDs
                              .length
                          );
                        },
                        0
                      ) *
                      100
                  ) / 100;

                const total =
                  Math.round(
                    (subtotal + volumeFee + cardMaintenanceFee) * 100
                  ) / 100;

                setSubscriptionPrices({
                  subtotal,
                  volumeFee,
                  cardMaintenanceFee,
                  total,
                });

                setSubscriptionObject(subscriptionObject);
                setRows(newRows);
              }
            });
        }
      })();
    }
  }, [business]);

  return (
    <SectionHeading title="CURRENT PERKIFY PLAN">
      <div className={classes.listContainer}>
        {subscriptionObject && subscriptionPrices ? (
          <>
            <div>
              <Typography style={{ fontSize: '20px' }}>
                {`$${subscriptionPrices.total.toFixed(2)} per month`}
              </Typography>
              <Typography>{`Your plan renews on ${dayjs
                .unix(subscriptionObject.current_period_end.seconds)
                .format('MMMM DD, YYYY')}`}</Typography>
            </div>
            {showBreakdown ? (
              <>
                <div>
                  <PriceBreakdownTable
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
    </SectionHeading>
  );
};
