import {
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  makeStyles,
  Theme,
} from '@material-ui/core';
import { AuthContext, BusinessContext, LoadingContext } from 'contexts';
import React, { useContext } from 'react';
import { PerkifyApi } from 'services';

const useDisplayCardPaymentMethodsStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogPaper: {
      minHeight: '200px',
      minWidth: '500px',
    },
  })
);

interface RemovePaymentMethodModalProps {
  paymentMethodIDToRemove: boolean;
  setPaymentMethodIDToRemove: (arg0: boolean) => void;
}

const RemovePaymentMethodModal = ({
  paymentMethodIDToRemove,
  setPaymentMethodIDToRemove,
}: RemovePaymentMethodModalProps) => {
  const classes = useDisplayCardPaymentMethodsStyles();
  const { business } = useContext(BusinessContext);
  const { currentUser } = useContext(AuthContext);
  const { setDashboardLoading, setFreezeNav, freezeNav } =
    useContext(LoadingContext);

  const removePaymentMethod = async (event: any) => {
    setDashboardLoading(true);
    setFreezeNav(true);
    // Block native form submission.
    event.preventDefault();

    const bearerToken = await currentUser.getIdToken();

    const result = (
      await PerkifyApi.delete(
        `rest/business/${business.businessID}/paymentMethod/${paymentMethodIDToRemove}`,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
    ).data;

    if (result.error) {
      // Display result.error.message in your UI.
    } else {
      console.log('Success');
    }
    setDashboardLoading(false);
    setFreezeNav(false);
  };

  return (
    <Dialog
      open={paymentMethodIDToRemove}
      onClose={() => setPaymentMethodIDToRemove(null)}
      aria-labelledby="form-dialog-title"
      classes={{ paper: classes.dialogPaper }}
    >
      <DialogTitle id="form-dialog-title">Remove Payment Method</DialogTitle>
      <DialogContent>
        <DialogContentText style={{ marginBottom: '30px' }}>
          Are you sure you want to remove this payment method? This cannot be
          undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          disabled={freezeNav}
          onClick={() => setPaymentMethodIDToRemove(null)}
          color="primary"
        >
          Cancel
        </Button>
        <Button
          disabled={freezeNav}
          onClick={async (event) => {
            await removePaymentMethod(event);
            setPaymentMethodIDToRemove(null);
          }}
          color="primary"
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemovePaymentMethodModal;
