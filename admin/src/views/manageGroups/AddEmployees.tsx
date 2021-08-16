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
import PurchaseConfirmation from 'components/PurchaseConfirmation';
import { AuthContext, LoadingContext } from 'contexts';
import React, { useContext, useState } from 'react';
import { PerkifyApi } from 'services';
import { validateEmails } from 'utils/emailValidation';

const AddEmployees = ({
  isAddEmployeesModalVisible,
  setIsAddEmployeesModalVisible,
  employees,
  group,
  groupPerks,
}) => {
  const [emailsToAdd, setEmailsToAdd] = useState('');
  const [emailsError, setEmailsError] = useState('');
  const [isConfirmationModalVisible, setConfirmationModalVisible] =
    useState(false);

  const { dashboardLoading, setDashboardLoading, freezeNav, setFreezeNav } =
    useContext(LoadingContext);

  const { currentUser } = useContext(AuthContext);
  const handleEmailError = (event) => {
    setEmailsToAdd(event.target.value);
    if (event.target.value === '') {
      setEmailsError('Please input atleast one email');
    } else if (!validateEmails(event.target.value)) {
      setEmailsError('Please input proper emails');
    } else {
      setEmailsError('');
    }
  };

  const addEmployeesToPerkGroup = (event) => {
    event.preventDefault();
    let error = false;
    if (emailsToAdd == '') {
      setEmailsError('Enter emails');
      error = true;
    }
    if (!error) {
      (async () => {
        setDashboardLoading(true);
        setFreezeNav(true);
        const bearerToken = await currentUser.getIdToken();

        const emailList = emailsToAdd.replace(/[,'"]+/gi, ' ').split(/\s+/); //Gives email as a list

        const afterEmployees = emailList.concat(
          employees.map((employeeObj) => employeeObj.email)
        );

        PerkifyApi.put(
          `rest/perkGroup/${group}`,
          {
            perks: groupPerks.map((perkObj) => perkObj.Name),
            emails: afterEmployees,
          },
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
          .then(() => {
            setDashboardLoading(false);
            setFreezeNav(false);
            setIsAddEmployeesModalVisible(false);
            setEmailsToAdd('');
          })
          .catch((e) => {
            console.log(e.response);
            alert(
              `Error. Reason: ${e.response.data.reason}. Details: ${e.response.data.reasonDetail}`
            );

            setDashboardLoading(false);
            setFreezeNav(false);
            setEmailsToAdd('');
          });
      })();
    }
  };

  function setVisible() {
    let error = false;
    if (emailsError != '') {
      return;
    }
    if (emailsToAdd == '') {
      setEmailsError('Enter emails');
      return;
    }
    setConfirmationModalVisible(true);
  }

  function generatePerks() {
    let retVal = [];
    groupPerks.forEach((perk) => {
      retVal.push(perk.Name);
    });
    return retVal;
  }

  return isConfirmationModalVisible ? (
    <PurchaseConfirmation
      isAddPerksModalVisible={isAddEmployeesModalVisible}
      setIsAddPerksModalVisible={setIsAddEmployeesModalVisible}
      title={'Add Perks'}
      text={
        'Are you sure you want to add these employees for a total cost of $'
      }
      onConfirmation={addEmployeesToPerkGroup}
      setConfirmationModalVisible={setConfirmationModalVisible}
      perks={generatePerks()}
      numPeople={emailsToAdd.replace(/[,'"]+/gi, ' ').split(/\s+/).length}
      creatingGroup={true}
    />
  ) : (
    <Dialog
      open={isAddEmployeesModalVisible}
      onClose={() => setIsAddEmployeesModalVisible(false)}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Add Users</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To add users to this perk group, please enter their email addresses
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
        <DialogActions>
          <Button
            onClick={() => setIsAddEmployeesModalVisible(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button onClick={setVisible} color="primary">
            Add Users
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployees;
