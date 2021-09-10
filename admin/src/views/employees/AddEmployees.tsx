import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from '@material-ui/core';
import { AuthContext, LoadingContext } from 'contexts';
import React, { useContext, useState } from 'react';
import { PerkifyApi } from 'services';
import { validateEmails } from 'utils/emailValidation';

interface AddEmployeesProps {
  isAddEmployeesModalVisible: boolean;
  setIsAddEmployeesModalVisible: (arg0: boolean) => void;
  peopleData: { email: string; group: string; id: string }[];
  groupData: string[];
}

const AddEmployees = ({
  isAddEmployeesModalVisible,
  setIsAddEmployeesModalVisible,
  peopleData,
  groupData,
}: AddEmployeesProps) => {
  // selected perk group from dropdown and respective error

  // emails entered into form and respective error
  const [emailsToAdd, setEmailsToAdd] = useState('');
  const [emailsError, setEmailsError] = useState('');

  // loading info
  const { dashboardLoading, setDashboardLoading, freezeNav, setFreezeNav } =
    useContext(LoadingContext);

  const { currentUser } = useContext(AuthContext);

  // handle email error
  const handleEmailError = (event: any) => {
    setEmailsToAdd(event.target.value);
    if (event.target.value === '') {
      setEmailsError('Please input at least one email');
    } else if (!validateEmails(event.target.value)) {
      setEmailsError('Please input proper emails');
    } else {
      setEmailsError('');
    }
  };

  function addUsers() {
    let error = false;
    if (emailsToAdd == '') {
      setEmailsError('Enter emails');
      error = true;
    }

    const emailList = emailsToAdd
      .trim()
      .replace(/[,'"]+/gi, ' ')
      .split(/\s+/); //Gives email as a list

    const duplicateEmail = emailList.find((email) =>
      peopleData.map((person) => person.email).includes(email)
    );

    if (duplicateEmail) {
      setEmailsError(
        `Attempting to add an employee with email ${duplicateEmail}, but that email already exists`
      );
      error = true;
    }

    if (error || emailsError != '') {
      return;
    }
    if (!error) {
      (async () => {
        setDashboardLoading(true);
        setFreezeNav(true);
        const bearerToken = await currentUser.getIdToken();

        const payload: CreateEmployeesPayload = {
          employeeEmails: emailList,
        };

        PerkifyApi.post(`rest/employee`, payload, {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
          },
        })
          .then(() => {
            setDashboardLoading(false);
            setFreezeNav(false);
            setIsAddEmployeesModalVisible(false);
            setEmailsToAdd('');
          })
          .catch((err) => {
            console.log(err.response);
            alert(
              `Error. Reason: ${err.response.data.reason}. Details: ${err.response.data.reasonDetail}`
            );
            setDashboardLoading(false);
            setFreezeNav(false);
            setEmailsToAdd('');
          });
      })();
    }
  }

  return (
    <Dialog
      open={isAddEmployeesModalVisible}
      onClose={() => setIsAddEmployeesModalVisible(false)}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Add Employees</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To add employees to this organization, please enter their email
          addresses below.
        </DialogContentText>
        <Typography style={{ marginTop: '30px', marginBottom: '15px' }}>
          Emails
        </Typography>
        <TextField
          id="emailaddresses"
          variant="outlined"
          label=""
          placeholder="Insert emails separated by commas or newlines"
          value={emailsToAdd}
          onChange={handleEmailError}
          fullWidth
          multiline
          rows={4}
          maxRows={4}
          error={emailsError != ''}
          helperText={emailsError}
        />
      </DialogContent>
      <DialogActions>
        <Button
          disabled={freezeNav}
          onClick={() => setIsAddEmployeesModalVisible(false)}
          color="primary"
        >
          Cancel
        </Button>
        <Button disabled={freezeNav} onClick={addUsers} color="primary">
          Add Employees
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEmployees;
