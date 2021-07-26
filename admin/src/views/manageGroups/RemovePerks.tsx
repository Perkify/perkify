import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import React from 'react';

const RemovePerks = ({
  isRemovePerksModalVisible,
  setIsRemovePerksModalVisible,
  selectedPerks,
  setSelectedPerks,
}) => {
  return (
    <Dialog
      open={isRemovePerksModalVisible}
      onClose={() => setIsRemovePerksModalVisible(false)}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Delete Users</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to remove these perks?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setIsRemovePerksModalVisible(false)}
          color="primary"
        >
          No
        </Button>
        <Button
          onClick={() => setIsRemovePerksModalVisible(false)}
          color="primary"
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemovePerks;
