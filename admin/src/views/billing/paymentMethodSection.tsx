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
import React, { useState } from 'react';
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

// interface DisplayCardPaymentMethodProps {}

// const DisplayCardPaymentMethod = () => {};

export const PaymentMethodsSection = () => {
  const classes = useDisplayCardPaymentMethodsStyles();
  const [addingPaymentMethod, setAddingPaymentMethod] = useState(false);

  return (
    <SectionHeading title="PAYMENT METHOD">
      <div className={classes.listContainer}>
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
