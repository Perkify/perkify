import {
  Button,
  Checkbox,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  makeStyles,
  Theme,
} from '@material-ui/core';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import React, { useState } from 'react';

const CARD_OPTIONS = {
  //   iconStyle: 'solid' as const,
  style: {
    base: {
      //       iconColor: '#c4f0ff',
      //       color: '#fff',
      fontWeight: 500,
      fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
      fontSize: '18px',
      //       fontSmoothing: 'antialiased',
      //       ':-webkit-autofill': {
      //         color: '#fce883',
      //       },
      //       '::placeholder': {
      //         color: '#87bbfd',
      //       },
    },
    //     invalid: {
    //       iconColor: '#ffc7ee',
    //       color: '#ffc7ee',
    //     },
  },
};

const useDisplayCardPaymentMethodsStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogPaper: {
      minHeight: '300px',
      minWidth: '500px',
    },
  })
);

interface AddPaymentMethodModalProps {
  isModalVisible: boolean;
  setIsModalVisible: (arg0: boolean) => void;
  onAddPaymentMethod: () => void;
}

const AddPaymentMethodModal = ({
  isModalVisible,
  setIsModalVisible,
  onAddPaymentMethod,
}: AddPaymentMethodModalProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const classes = useDisplayCardPaymentMethodsStyles();
  const [useAsDefaultCreditCard, setUseAsDefaultCreditCard] = useState(false);

  const handleSubmit = async (event: any) => {
    // Block native form submission.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const cardElement = elements.getElement(CardElement);

    // Use your card Element with other Stripe.js APIs
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.log('[error]', error);
    } else {
      console.log('[PaymentMethod]', paymentMethod);
    }
  };

  return (
    <Dialog
      open={isModalVisible}
      onClose={() => setIsModalVisible(false)}
      aria-labelledby="form-dialog-title"
      classes={{ paper: classes.dialogPaper }}
    >
      <DialogTitle id="form-dialog-title">Add Payment Method</DialogTitle>
      <DialogContent>
        <DialogContentText style={{ marginBottom: '30px' }}>
          Please add your credit card below.
        </DialogContentText>
        {/* <div style={{ marginTop: '20px' }}> */}
        <CardElement options={CARD_OPTIONS} />
        <FormControlLabel
          style={{ marginTop: '20px', fontSize: '14px' }}
          control={
            <Checkbox
              checked={useAsDefaultCreditCard}
              onChange={(event) =>
                setUseAsDefaultCreditCard(event.target.checked)
              }
              name="useAsDefaultCreditCard"
              color="primary"
            />
          }
          label="Use as default payment method"
        />
        {/* </div> */}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsModalVisible(false)} color="primary">
          Cancel
        </Button>
        <Button
          onClick={async () => {
            await onAddPaymentMethod();
            setIsModalVisible(false);
          }}
          color="primary"
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPaymentMethodModal;
