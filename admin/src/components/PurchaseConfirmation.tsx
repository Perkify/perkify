import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import { LoadingContext } from 'contexts';
import React, { useContext } from 'react';
import { allPerksDict } from 'shared';

interface PurchaseConfirmationProps {
  isAddPerksModalVisible: boolean;
  setIsAddPerksModalVisible: (arg0: boolean) => void;
  title: string;
  text: string;
  onConfirmation: (arg0: any) => void;
  setConfirmationModalVisible: (arg0: boolean) => void;
  perks: string[];
  numPeople: number;
  creatingGroup: boolean;
}

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
}: PurchaseConfirmationProps) => {
  function roundNumber(num: number) {
    return Math.round(100 * num) / 100;
  }
  const { freezeNav } = useContext(LoadingContext);

  function calculateCost() {
    let cost = 0;
    perks.forEach((perk) => {
      cost += allPerksDict[perk].Cost;
    });
    if (creatingGroup) {
      return roundNumber(cost * numPeople * 1.1 + 3.99 * numPeople).toFixed(2);
    }
    return roundNumber(cost * numPeople * 1.1).toFixed(2);
  }
  return (
    <Dialog
      open={isAddPerksModalVisible}
      onClose={() => setIsAddPerksModalVisible(false)}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {text + calculateCost() + '/month'}?
        </DialogContentText>
        <DialogActions>
          <Button
            disabled={freezeNav}
            onClick={() => {
              setIsAddPerksModalVisible(false);
              setConfirmationModalVisible(false);
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button disabled={freezeNav} onClick={onConfirmation} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseConfirmation;
