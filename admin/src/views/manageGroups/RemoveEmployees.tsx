import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import React from 'react';

const RemoveEmployees = ({
  isRemoveEmployeesModalVisible,
  setIsRemoveEmployeesModalVisible,
  selectedEmployees,
  setSelectedEmployees,
}) => {
  return (
    <Dialog
      open={isRemoveEmployeesModalVisible}
      onClose={() => setIsRemoveEmployeesModalVisible(false)}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Delete Users</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to remove these employees?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setIsRemoveEmployeesModalVisible(false)}
          color="primary"
        >
          No
        </Button>
        <Button
          onClick={() => setIsRemoveEmployeesModalVisible(false)}
          color="primary"
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemoveEmployees;
