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
          <img
            style={{ height: 25 }}
            src="/credit-card-payment-icons/visa.svg"
          />
          <Typography variant="body1">&bull;&bull;&bull;&bull;</Typography>
          <Typography variant="body1">{card.last4}</Typography>
          <Chip label="Default" style={{ height: 20 }} />
        </div>
      </Grid>

      <Grid item xs={4}>
        <div className={classes.root}>
          <Typography variant="body1">{`Expires ${card.expMonth
            .toString()
            .padStart(2, '0')}/${card.expYear}`}</Typography>
          <IconButton
            aria-label="clear"
            style={{ margin: 0, padding: 0, marginLeft: '40px' }}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
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
          Object.values(business.cardPaymentMethods).map((card) => (
            <DisplayCardPaymentMethod card={card} />
          ))}
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
