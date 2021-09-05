import { Grid, IconButton, Typography } from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import * as dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { db } from 'services';
import { allPerksByPriceIDDict, cardMaintenancePerk } from 'shared';
import PriceBreakdownTable from './priceBreakdownTable';
import { SectionHeading } from './sectionHeading';

interface SimpleLineItem {
  priceID: string;
  quantity: number;
  amount: number;
}

export const InvoiceDetails = ({
  invoiceObject,
  onClose,
  business,
}: {
  invoiceObject: any;
  onClose: any;
  business: any;
}) => {
  const [rows, setRows] = useState<CostBreakdownRow[]>([]);
  const [subscriptionPrices, setSubscriptionPrices] =
    useState<SubscriptionPrices>(null);
  const [cardData, setCardData] = useState<any>(null);

  useEffect(() => {
    if (invoiceObject) {
      // get the card data related to the business
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

      // merge line items together if they are related to the same priceID
      const mergedLineItems: { [key: string]: SimpleLineItem } =
        invoiceObject.lines.data
          .map((lineItem: any) => ({
            priceID: lineItem.price.id,
            quantity: lineItem.quantity,
            amount: lineItem.amount / 100,
          }))
          .reduce(
            (
              acc: { [key: string]: SimpleLineItem },
              simpleLineItem: SimpleLineItem
            ) => {
              if (simpleLineItem.priceID in acc) {
                const accLineItem = acc[simpleLineItem.priceID];
                acc[simpleLineItem.priceID] = {
                  priceID: simpleLineItem.priceID,
                  quantity:
                    accLineItem.quantity +
                    (simpleLineItem.amount > 0
                      ? simpleLineItem.quantity
                      : -simpleLineItem.quantity),
                  amount: accLineItem.amount + simpleLineItem.amount,
                };
              } else {
                acc[simpleLineItem.priceID] = {
                  priceID: simpleLineItem.priceID,
                  quantity:
                    simpleLineItem.amount > 0
                      ? simpleLineItem.quantity
                      : -simpleLineItem.quantity,
                  amount: simpleLineItem.amount,
                };
              }
              return acc;
            },
            {}
          );

      // get the new cost breakdown table rows
      const newRows: CostBreakdownRow[] = Object.values(mergedLineItems)
        .filter((lineItem) => lineItem.priceID in allPerksByPriceIDDict)
        .map((simpleLineItem) => ({
          perkName: allPerksByPriceIDDict[simpleLineItem.priceID].Name,
          price: allPerksByPriceIDDict[simpleLineItem.priceID].Cost,
          quantity: simpleLineItem.quantity,
          amount: simpleLineItem.amount,
        }));

      // get the card maintenance fee
      const cardMaintenanceFee =
        Object.values(mergedLineItems)
          .filter(
            (lineItem) => lineItem.priceID == cardMaintenancePerk.stripePriceID
          )
          .map((simpleLineItem) => ({
            perkName: cardMaintenancePerk.name,
            price: cardMaintenancePerk.cost,
            quantity: simpleLineItem.quantity,
            amount: simpleLineItem.amount,
          }))?.[0]?.amount || 0;

      const subtotal = newRows.reduce((acc, row) => {
        return acc + row.amount;
      }, 0);

      const volumeFee = Math.round(subtotal * 0.1 * 100) / 100;

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
