import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import { GridSelectionModel } from '@material-ui/data-grid';
import { AuthContext, BusinessContext, LoadingContext } from 'contexts';
import React, { useContext } from 'react';
import { PerkifyApi } from 'services';

interface AddEmployeesProps {
  isRemoveEmployeesModalVisible: boolean;
  setIsRemoveEmployeesModalVisible: (arg0: boolean) => void;
  employees: { email: string; group: string; id: string; employeeID: string }[];
  group: string;
  selectedEmployees: GridSelectionModel;
  setSelectedEmployees: (model: GridSelectionModel) => void;
}

const RemoveEmployees = ({
  isRemoveEmployeesModalVisible,
  setIsRemoveEmployeesModalVisible,
  selectedEmployees,
  setSelectedEmployees,
  group,
  employees,
}: AddEmployeesProps) => {
  const { currentUser } = useContext(AuthContext);
  const { business } = useContext(BusinessContext);
  const { dashboardLoading, setDashboardLoading, freezeNav, setFreezeNav } =
    useContext(LoadingContext);

  const removeUsers = (event: any) => {
    let error = false;

    event.preventDefault();
    if (!error) {
      (async () => {
        setDashboardLoading(true);
        setFreezeNav(true);
        const bearerToken = await currentUser.getIdToken();
        // get all employees that are not selected
        // by removing all employees that were selected
        const afterEmployees = employees.filter(
          (employee, index) => selectedEmployees.indexOf(index) == -1
        );
        const afterEmails = afterEmployees.map(
          (employee) => employee.employeeID
        );

        if (afterEmails.length == 0) {
          setDashboardLoading(false);
          setFreezeNav(false);
          alert('Error: cannot remove all employees from a perk group');
          return;
        }

        const payload: UpdatePerkGroupPayload = {
          employeeIDs: afterEmails,
          perkNames: business.perkGroups[group].perkNames,
          perkGroupName: business.perkGroups[group].perkGroupName,
        };

        await PerkifyApi.put(`rest/perkGroup/${group}`, payload, {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
          },
        });
        setDashboardLoading(false);
        setFreezeNav(false);
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
