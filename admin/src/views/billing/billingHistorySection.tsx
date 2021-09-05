import { Button, Drawer, Grid, Theme, Typography } from '@material-ui/core';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { createStyles, makeStyles } from '@material-ui/styles';
import { BusinessContext } from 'contexts';
import * as dayjs from 'dayjs';
import { db } from 'firebaseApp';
import React, { useContext, useEffect, useState } from 'react';
import { Subscription } from '../../types/stripeTypes';
import { InvoiceDetails } from './invoiceDetails';
import { SectionHeading } from './sectionHeading';

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
  const [invoiceRows, setInvoiceRows] = useState<any[]>(null);
  const [invoiceObjects, setInvoiceObjects] = useState<any[]>(null);
  const [viewInvoiceDetailsID, setViewInvoiceDetailsID] = useState<any>(null);

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
            .collection('invoices')
            .onSnapshot((invoicesSnapshot) => {
              // want to get paid invoices, their dates, and their price
              const paidInvoices = invoicesSnapshot.docs
                .filter((doc) => doc.data().status == 'paid')
                .sort((a, b) => (a.data().paid_at > b.data().paid_at ? -1 : 1));

              setInvoiceRows(
                paidInvoices.map((invoice) => ({
                  paidAt: invoice.data().status_transitions.paid_at,
                  total: invoice.data().total,
                  id: invoice.data().id,
                }))
              );

              setInvoiceObjects(paidInvoices.map((invoice) => invoice.data()));
            });
        }
      })();
    }
  }, [business]);

  return (
    <SectionHeading title="BILLING HISTORY">
      <div className={classes.listContainer}>
        {invoiceRows ? (
          <>
            {invoiceRows
              .slice(
                0,
                showMore
                  ? invoiceRows.length
                  : invoiceRows.length >= 3
                  ? 3
                  : invoiceRows.length
              )
              .map((invoiceObj) => (
                <Grid container>
                  <Grid item xs={3}>
                    <Typography
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {dayjs.unix(invoiceObj.paidAt).format('MMMM DD, YYYY')}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography>{`$${invoiceObj.total / 100}`}</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography
                      onClick={() => {
                        setViewInvoiceDetailsID(invoiceObj.id);
                      }}
                      variant="button"
                      style={{ cursor: 'pointer' }}
                    >
                      View invoice details
                    </Typography>
                  </Grid>
                </Grid>
              ))}
            {invoiceRows.length <= 3 ? null : showMore ? (
              <Grid container>
                <Grid item xs={3}>
                  <Button
                    variant="text"
                    disableRipple
                    onClick={() => setShowMore(false)}
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
                      Show less
                    </Typography>
                  </Button>
                </Grid>
              </Grid>
            ) : (
              <Grid container>
                <Grid item xs={3}>
                  <Button
                    variant="text"
                    disableRipple
                    onClick={() => setShowMore(true)}
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
                      Show More
                    </Typography>
                  </Button>
                </Grid>
              </Grid>
            )}
          </>
        ) : (
          <Typography>
            No billing history related to the current perkify plan. This
            business does not have a perkify plan yet.
          </Typography>
        )}
      </div>
      <Drawer
        anchor="right"
        open={viewInvoiceDetailsID}
        onClose={() => setViewInvoiceDetailsID(null)}
      >
        {invoiceObjects && (
          <InvoiceDetails
            invoiceObject={
              invoiceObjects.filter(
                (invoiceObject) => invoiceObject.id == viewInvoiceDetailsID
              )[0]
            }
            onClose={() => setViewInvoiceDetailsID(null)}
            business={business}
          />
        )}
      </Drawer>
    </SectionHeading>
  );
};
