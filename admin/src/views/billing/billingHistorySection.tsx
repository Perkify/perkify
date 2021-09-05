import { Drawer, Grid, IconButton, Theme, Typography } from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import { createStyles, makeStyles } from '@material-ui/styles';
import { BusinessContext } from 'contexts';
import * as dayjs from 'dayjs';
import { db } from 'firebaseApp';
import React, { useContext, useEffect, useState } from 'react';
import { allPerksByPriceIDDict } from 'shared';
import { Subscription } from '../../types/stripeTypes';
import PriceBreakdownTable from './priceBreakdownTable';
import { SectionHeading } from './sectionHeading';

interface CostBreakdownRow {
  perkName: string;
  quantity: number;
  price: number;
  amount: number;
}

interface SubscriptionPrices {
  subtotal: number;
  volumeFee: number;
  cardMaintenanceFee: number;
  total: number;
}

const useInvoiceDetailsStyles = makeStyles((theme: Theme) => createStyles({}));

const InvoiceDetails = ({
  invoiceObject,
  onClose,
  business,
}: {
  invoiceObject: any;
  onClose: any;
  business: any;
}) => {
  const classes = useInvoiceDetailsStyles();

  const [rows, setRows] = useState<CostBreakdownRow[]>([]);
  const [subscriptionPrices, setSubscriptionPrices] =
    useState<SubscriptionPrices>(null);
  const [cardData, setCardData] = useState<any>(null);

  useEffect(() => {
    if (invoiceObject) {
      db.collection('businesses')
        .doc(business.businessID)
        .collection('payments')
        .doc(invoiceObject.payment_intent)
        .get()
        .then((paymentIntentDoc) => {
          setCardData(
            paymentIntentDoc.data().charges.data[0].payment_method_details.card
          );
        });

      const newRows: CostBreakdownRow[] = invoiceObject.lines.data
        .filter((lineItem: any) => lineItem.price.id in allPerksByPriceIDDict)
        .map((lineItem: any) => ({
          perkName: allPerksByPriceIDDict[lineItem.price.id].Name,
          quantity: lineItem.quantity,
          price: allPerksByPriceIDDict[lineItem.price.id].Cost,
          amount: lineItem.amount / 100,
        }));

      const cardMaintenanceFeeItem = invoiceObject.lines.data.filter(
        (lineItem: any) => !(lineItem.price.id in allPerksByPriceIDDict)
      )[0];

      const subtotal = newRows.reduce((acc, row) => {
        return acc + row.amount;
      }, 0);

      const volumeFee = Math.round(subtotal * 0.1 * 100) / 100;

      const cardMaintenanceFee =
        Math.round(3.99 * cardMaintenanceFeeItem.quantity * 100) / 100;

      const total =
        Math.round((subtotal + volumeFee + cardMaintenanceFee) * 100) / 100;

      setSubscriptionPrices({
        subtotal,
        volumeFee,
        cardMaintenanceFee,
        total,
      });

      setRows(newRows);
    }
  }, [invoiceObject]);

  return (
    <div style={{ padding: '40px', minWidth: 700 }}>
      {rows && subscriptionPrices && invoiceObject && (
        <>
          <div>
            <Typography variant="button" style={{ color: 'grey' }}>
              {`Invoice #${invoiceObject.number}`}
            </Typography>

            <IconButton
              aria-label="clear"
              style={{
                backgroundColor: 'transparent',
                marginLeft: 'auto',
                flex: 1,
                margin: 0,
                padding: 0,
                float: 'right',
              }}
              disableRipple
              onClick={() => onClose()}
            >
              <ClearIcon fontSize="small" style={{ marginLeft: 'auto' }} />
            </IconButton>
          </div>

          <Typography
            variant="h4"
            style={{ fontWeight: 'bold', marginBottom: '60px' }}
          >
            {`$${subscriptionPrices.total}`}
          </Typography>

          <SectionHeading title="SUMMARY" color="grey">
            <Grid container>
              <Grid item xs={3}>
                Payment date:
              </Grid>
              <Grid item xs={6}>
                <Typography>
                  {dayjs
                    .unix(invoiceObject.status_transitions.paid_at)
                    .format('MMMM DD, YYYY')}
                </Typography>
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={3}>
                Payment method:
              </Grid>
              <Grid item xs={6}>
                {cardData && (
                  <Typography>{`${
                    cardData.brand.charAt(0).toUpperCase() +
                    cardData.brand.slice(1)
                  } \u2022\u2022\u2022\u2022 ${cardData.last4}`}</Typography>
                )}
              </Grid>
            </Grid>

            <Grid container>
              <Grid item xs={3}>
                From:
              </Grid>
              <Grid item xs={6}>
                <Typography>{invoiceObject.account_name}</Typography>
              </Grid>
            </Grid>
          </SectionHeading>

          <SectionHeading title="ITEMS" color="grey">
            <PriceBreakdownTable
              rows={rows}
              subscriptionPrices={subscriptionPrices}
            />
          </SectionHeading>
        </>
      )}
    </div>
  );
};

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

        db.collection('businesses')
          .doc(business.businessID)
          .collection('subscriptions')
          .doc(staticSubscriptionItem.id)
          .collection('invoices')
          .onSnapshot((invoicesSnapshot) => {
            // want to get paid invoices, their dates, and their price
            const paidInvoices = invoicesSnapshot.docs.filter(
              (doc) => doc.data().status == 'paid'
            );

            setInvoiceRows(
              paidInvoices.map((invoice) => ({
                paidAt: invoice.data().status_transitions.paid_at,
                total: invoice.data().total,
                id: invoice.data().id,
              }))
            );

            setInvoiceObjects(paidInvoices.map((invoice) => invoice.data()));
          });
      })();
    }
  }, [business]);

  return (
    <>
      <div className={classes.listContainer}>
        {invoiceRows &&
          invoiceRows.map((invoiceObj) => (
            <Grid container>
              <Grid item xs={3}>
                <Typography
                  style={{
                    // fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {dayjs.unix(invoiceObj.paidAt).format('MMMM DD, YYYY')}
                  {/* <OpenInNewIcon fontSize="small" style={{ marginLeft: '5px' }} /> */}
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
                  style={{ cursor: 'pointer' }}
                >
                  View invoice details
                </Typography>
              </Grid>
            </Grid>
          ))}
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
    </>
  );
};
