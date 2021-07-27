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
      setIsRemoveEmployeesModalVisible(false);

      (async () => {
        const bearerToken = await currentUser.getIdToken();
        // get all employees that are not selected
        const afterEmployees = employees.filter((employee) => {
          return selectedEmployees.some(
            (selectedEmployee) => selectedEmployee === employee.id
          );
        });
        const afterEmails = afterEmployees.map((employee) => employee.email);

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
        setSelectedEmployees(afterEmails);
        setIsRemoveEmployeesModalVisible(false);
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
