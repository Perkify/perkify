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
import { AuthContext, BusinessContext, LoadingContext } from 'contexts';
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

  const { business } = useContext(BusinessContext);
  const [selectedPerkGroup, setSelectedPerkGroup] = useState('');
  const [selectedPerkGroupError, setSelectedPerkGroupError] = useState('');
  const [isConfirmationModalVisible, setConfirmationModalVisible] =
    useState(false);

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
      setEmailsError('Please input atleast one email');
    } else if (!validateEmails(event.target.value)) {
      setEmailsError('Please input proper emails');
    } else {
      setEmailsError('');
    }
  };

  const addToPerkGroup = (event: any) => {
    event.preventDefault();
    let error = false;
    if (emailsToAdd == '') {
      setEmailsError('Enter emails');
      error = true;
    }
    if (selectedPerkGroup.length == 0) {
      setSelectedPerkGroupError('Select perk group');
      error = true;
    }
    if (!error) {
      (async () => {
        setDashboardLoading(true);
        setFreezeNav(true);
        const bearerToken = await currentUser.getIdToken();

        const emailList = emailsToAdd
          .trim()
          .replace(/[,'"]+/gi, ' ')
          .split(/\s+/); //Gives email as a list
        const payload = {
          epmloyeeEmails: emailList,
        };

        PerkifyApi.post(`rest/perkGroup/${selectedPerkGroup}`, payload, {
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
            setSelectedPerkGroup('');
          })
          .catch((err) => {
            console.log(err.response);
            alert(
              `Error. Reason: ${err.response.data.reason}. Details: ${err.response.data.reasonDetail}`
            );
            setDashboardLoading(false);
            setFreezeNav(false);
            setEmailsToAdd('');
            setSelectedPerkGroup('');
          });
      })();
    }
  };

  function generatePerks() {
    return ['Netflix Standard'];
  }

  function addUsers() {
    let error = false;
    if (emailsToAdd == '') {
      setEmailsError('Enter emails');
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

        const emailList = emailsToAdd
          .trim()
          .replace(/[,'"]+/gi, ' ')
          .split(/\s+/); //Gives email as a list
        const payload = {
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
            setSelectedPerkGroup('');
          })
          .catch((err) => {
            console.log(err.response);
            alert(
              `Error. Reason: ${err.response.data.reason}. Details: ${err.response.data.reasonDetail}`
            );
            setDashboardLoading(false);
            setFreezeNav(false);
            setEmailsToAdd('');
            setSelectedPerkGroup('');
          });
      })();
    }

    //TODO: Add Users
    //setConfirmationModalVisible(true);
  }

  return (
    <Dialog
      open={isAddEmployeesModalVisible}
      onClose={() => setIsAddEmployeesModalVisible(false)}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Add Users</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To add users to this organization, please enter their email addresses
          below.
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
          onClick={() => setIsAddEmployeesModalVisible(false)}
          color="primary"
        >
          Cancel
        </Button>
        <Button onClick={addUsers} color="primary">
          Add Users
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEmployees;
