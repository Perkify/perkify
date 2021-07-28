import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import React from 'react';

const ConfirmationModal = ({
  isModalVisible,
  setIsModalVisible,
  title,
  description,
  onConfirmation,
}) => {
  return (
    <Dialog
      open={isModalVisible}
      onClose={() => setIsModalVisible(false)}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsModalVisible(false)} color="primary">
          No
        </Button>
        <Button
          onClick={async () => {
            await onConfirmation();
            setIsModalVisible(false);
          }}
          color="primary"
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;
