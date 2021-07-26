import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import React from 'react';
import { AuthContext } from 'contexts/Auth';
import { useContext, useState } from 'react';
import { PerkifyApi } from 'services';


const RemoveEmployees = ({
  isRemoveEmployeesModalVisible,
  setIsRemoveEmployeesModalVisible,
  selectedEmployees,
  setSelectedEmployees,
  group, 
  employees,
  selectedPerks
}) => {


  const { currentUser } = useContext(AuthContext);

  const removeUsers = (event) => {
    let error = false;

    event.preventDefault();
    if (!error) {
      setIsRemoveEmployeesModalVisible(false);

      (async () => {
        const bearerToken = await currentUser.getIdToken();
        console.log(employees)
        console.log("hello")
        console.log(selectedEmployees)
        console.log(setSelectedEmployees)
        const afterEmails = employees.filter(employee => {
          console.log(employee)
          let retVal = true
          selectedEmployees.forEach(selected => {
            if (selected === employee.id){
              console.log("hello")
              retVal = false
            }
          });
          return retVal
        })
        let afterEmployeeList = []
        afterEmails.forEach(perkObj => {
          console.log(perkObj)
          afterEmployeeList.push(perkObj.email)
        });
        console.log(afterEmployeeList);
        console.log(selectedEmployees);
        setSelectedEmployees([])
        console.log(selectedEmployees);

        await PerkifyApi.put(
          'user/auth/updatePerkGroup',
          JSON.stringify({
            group,
            emails: afterEmployeeList,
            perks: undefined,
          }),
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
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
          onClick={() => {
            setIsRemoveEmployeesModalVisible(false)
          }}
          color="primary"
        >
          No
        </Button>
        <Button
          onClick={
            () => {
              console.log("Selected employees")
              console.log(selectedEmployees);

              setSelectedEmployees([]);
              console.log(selectedEmployees);
              setIsRemoveEmployeesModalVisible(false);
            }}
          color="primary"
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemoveEmployees;
