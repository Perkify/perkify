import {
  Button,
  Chip,
  Grid,
  IconButton,
  Theme,
  Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { createStyles, makeStyles } from '@material-ui/styles';
import { BusinessContext } from 'contexts';
import React, { useContext, useState } from 'react';
import AddPaymentMethodModal from './addPaymentMethodModal';
import { SectionHeading } from './sectionHeading';

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
    listContainer: {
      '& > *': {
        '&:not(:first-child)': {
          marginTop: '20px',
        },
      },
    },
  })
);

const cardPaymentIconPath = (brand: string) => {
  //  amex, diners, discover, jcb, mastercard, unionpay, visa, or unknown
  switch (brand) {
    case 'amex':
      return '/credit-card-payment-icons/amex.svg';
    case 'diners':
      return '/credit-card-payment-icons/diners.svg';
    case 'discover':
      return '/credit-card-payment-icons/discover.svg';
    case 'jcb':
      return '/credit-card-payment-icons/jcb.svg';
    case 'mastercard':
      return '/credit-card-payment-icons/mastercard.svg';
    case 'unionpay':
      return '/credit-card-payment-icons/unionpay.svg';
    case 'visa':
      return '/credit-card-payment-icons/visa.svg';
    case 'unknown':
      return '/credit-card-payment-icons/unknown.svg';
    default:
      break;
  }
};

const DisplayCardPaymentMethod = ({
  card,
}: {
  card: SimpleCardPaymentMethod;
}) => {
  const classes = useDisplayCardPaymentMethodsStyles();
  return (
    <Grid container>
      <Grid item xs={4}>
        <div className={classes.root}>
          <img style={{ height: 25 }} src={cardPaymentIconPath(card.brand)} />
          <Typography variant="body1">&bull;&bull;&bull;&bull;</Typography>
          <Typography variant="body1">{card.last4}</Typography>
          {card.default && <Chip label="Default" style={{ height: 20 }} />}
        </div>
      </Grid>

      <Grid item xs={3}>
        <div className={classes.root}>
          <Typography variant="body1">{`Expires ${card.expMonth
            .toString()
            .padStart(2, '0')}/${card.expYear}`}</Typography>
          {card.default ? (
            <IconButton
              aria-label="clear"
              style={{
                margin: 0,
                padding: 0,
                flex: 1,
                backgroundColor: 'transparent',
              }}
              disableRipple
            >
              <ClearIcon fontSize="small" style={{ marginLeft: 'auto' }} />
            </IconButton>
          ) : (
            <IconButton
              aria-label="options"
              style={{
                margin: 0,
                padding: 0,
                flex: 1,
                backgroundColor: 'transparent',
              }}
              disableRipple
            >
              <MoreHorizIcon fontSize="small" style={{ marginLeft: 'auto' }} />
            </IconButton>
          )}
        </div>
      </Grid>
    </Grid>
  );
};

const usePaymentMethodsSectionStyles = makeStyles((theme: Theme) =>
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
    listContainer: {
      '& > *': {
        '&:not(:first-child)': {
          marginTop: '20px',
        },
      },
    },
  })
);

export const PaymentMethodsSection = () => {
  const classes = usePaymentMethodsSectionStyles();
  const [addingPaymentMethod, setAddingPaymentMethod] = useState(false);

  const { business } = useContext(BusinessContext);

  return (
    <SectionHeading title="PAYMENT METHOD">
      <div className={classes.listContainer}>
        {business &&
          Object.values(business.cardPaymentMethods)
            // sort the payment methods so that the default payment method goes first
            .sort((a, b) => (a.default ? -1 : 1))
            .map((card) => <DisplayCardPaymentMethod card={card} />)}
        <div>
          <Button
            variant="text"
            disableRipple
            onClick={() => setAddingPaymentMethod(true)}
            style={{
              padding: 0,
              margin: '0',
              textTransform: 'none',
              backgroundColor: 'transparent',
            }}
          >
            <Typography
              variant="body1"
              style={{ color: 'grey', display: 'flex', alignItems: 'center' }}
            >
              <AddIcon fontSize="small" style={{ marginRight: '5px' }} />
              Add Payment Method
            </Typography>
          </Button>
        </div>
        <AddPaymentMethodModal
          isModalVisible={addingPaymentMethod}
          setIsModalVisible={setAddingPaymentMethod}
          onAddPaymentMethod={() => {}}
        />
      </div>
    </SectionHeading>
  );
};
