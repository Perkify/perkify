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
import { AuthContext, BusinessContext, LoadingContext } from 'contexts';
import React, { useContext, useState } from 'react';
import { PerkifyApi } from 'services';

const CARD_OPTIONS = {
  style: {
    base: {
      fontWeight: 500,
      fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
      fontSize: '18px',
    },
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
}

const AddPaymentMethodModal = ({
  isModalVisible,
  setIsModalVisible,
}: AddPaymentMethodModalProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const classes = useDisplayCardPaymentMethodsStyles();
  const [useAsDefaultCreditCard, setUseAsDefaultCreditCard] = useState(true);
  const { business } = useContext(BusinessContext);
  const { currentUser } = useContext(AuthContext);

  const { setDashboardLoading, setFreezeNav, freezeNav } =
    useContext(LoadingContext);

  const handleSubmit = async (event: any) => {
    // Block native form submission.
    event.preventDefault();
    setFreezeNav(true);
    setDashboardLoading(true);

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    const bearerToken = await currentUser.getIdToken();

    const { setupIntentClientSecret } = (
      await PerkifyApi.post(
        `rest/business/${business.businessID}/setupIntent`,
        {},
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
    ).data;

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const cardElement = elements.getElement(CardElement);

    // Use your card Element with other Stripe.js APIs
    const result = await stripe.confirmCardSetup(setupIntentClientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (result.error) {
      // Display result.error.message in your UI.
    } else {
      // The setup has succeeded. Display a success message and send
      // result.setupIntent.payment_method to your server to save the
      // card to a Customer
      const payload: AddPaymentMethodPayload = {
        paymentMethodID: result.setupIntent.payment_method,
        useAsDefaultCreditCard,
      };

      try {
        await PerkifyApi.post(
          `rest/business/${business.businessID}/paymentMethod`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
      } catch (error) {
        alert(error.response.data.reason);
      }
    }
    setDashboardLoading(false);
    setFreezeNav(false);
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
        <CardElement options={CARD_OPTIONS} />
        {business && Object.keys(business.cardPaymentMethods).length != 0 && (
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
        )}
      </DialogContent>
      <DialogActions>
        <Button
          disabled={freezeNav}
          onClick={() => setIsModalVisible(false)}
          color="primary"
        >
          Cancel
        </Button>
        <Button
          disabled={freezeNav}
          onClick={async (event) => {
            await handleSubmit(event);
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
