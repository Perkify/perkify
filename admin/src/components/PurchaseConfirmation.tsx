import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import React from 'react';
import { allPerksDict } from 'shared';

const PurchaseConfirmation = ({
  isAddPerksModalVisible,
  setIsAddPerksModalVisible,
  title,
  text,
  onConfirmation,
  setConfirmationModalVisible,
  perks,
  numPeople,
  creatingGroup,
}) => {
  function roundNumber(num) {
    return Math.round(100 * num) / 100;
  }
  function calculateCost() {
    let cost = 0;
    perks.forEach((perk) => {
      cost += allPerksDict[perk].Cost;
    });
    if (creatingGroup) {
      return roundNumber(cost * numPeople * 1.1 + 4 * numPeople).toFixed(2);
    }
    return roundNumber(cost * numPeople).toFixed(2);
  }
  return (
    <Dialog
      open={isAddPerksModalVisible}
      onClose={() => setIsAddPerksModalVisible(false)}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{text + calculateCost()}?</DialogContentText>
        <DialogActions>
          <Button
            onClick={() => {
              setIsAddPerksModalVisible(false);
              setConfirmationModalVisible(false);
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button onClick={onConfirmation} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseConfirmation;
