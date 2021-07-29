import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import { AuthContext } from 'contexts';
import React, { useContext } from 'react';
import { PerkifyApi } from 'services';

const RemoveEmployees = ({
  isRemoveEmployeesModalVisible,
  setIsRemoveEmployeesModalVisible,
  selectedEmployees,
  setSelectedEmployees,
  group,
  employees,
}) => {
  const { currentUser } = useContext(AuthContext);

  const removeUsers = (event) => {
    let error = false;

    event.preventDefault();
    if (!error) {
      (async () => {
        const bearerToken = await currentUser.getIdToken();
        // get all employees that are not selected
        // by removing all employees that were selected
        const afterEmployees = employees.filter(
          (employee, index) => selectedEmployees.indexOf(index) == -1
        );
        const afterEmails = afterEmployees.map((employee) => employee.email);

        if (afterEmails.length == 0) {
          alert('Error: cannot remove all employees from a perk group');
          return;
        }

        await PerkifyApi.put(
          'user/auth/updatePerkGroup',
          JSON.stringify({
            group,
            emails: afterEmails,
            perks: undefined,
          }),
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        setIsRemoveEmployeesModalVisible(false);
        setSelectedEmployees([]);
      })();
    }
  };

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
        <Button onClick={removeUsers} color="primary">
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemoveEmployees;
