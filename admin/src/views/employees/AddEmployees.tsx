import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core';
import PurchaseConfirmation from 'components/PurchaseConfirmation';
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

        const emailList = emailsToAdd.replace(/[,'"]+/gi, ' ').split(/\s+/); //Gives email as a list

        PerkifyApi.put(
          `rest/perkGroup/${selectedPerkGroup}`,
          {
            perkNames: business.perkGroups[selectedPerkGroup].perkNames,
            emails: emailList.concat(
              peopleData
                .filter((employeeObj) => employeeObj.group == selectedPerkGroup)
                .map((employeeObj) => employeeObj.email)
            ),
          } as UpdatePerkGroupPayload,
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
            setSelectedPerkGroup('');
          })
          .catch((e) => {
            console.log(e.response);
            alert(
              `Error. Reason: ${e.response.data.reason}. Details: ${e.response.data.reasonDetail}`
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
    return business.perkGroups[selectedPerkGroup].perkNames;
  }

  function setVisible() {
    let error = false;
    if (emailsToAdd == '') {
      setEmailsError('Enter emails');
      error = true;
    }
    if (selectedPerkGroup.length == 0) {
      setSelectedPerkGroupError('Select perk group');
      error = true;
    }
    if (error || emailsError != '') {
      return;
    }
    setConfirmationModalVisible(true);
  }

  return isConfirmationModalVisible ? (
    <PurchaseConfirmation
      isAddPerksModalVisible={isAddEmployeesModalVisible}
      setIsAddPerksModalVisible={setIsAddEmployeesModalVisible}
      title={'Add Employees'}
      text={
        'Are you sure you want to add these employees for a total cost of $'
      }
      onConfirmation={addToPerkGroup}
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
          To add users to this organization, please enter their email addresses
          below and select a group from the dropdown.
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
        <Typography style={{ marginTop: '30px', marginBottom: '15px' }}>
          Perk Group
        </Typography>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          displayEmpty
          variant="outlined"
          value={selectedPerkGroup}
          fullWidth
          onChange={(event) => {
            setSelectedPerkGroupError('');
            setSelectedPerkGroup(event.target.value as string);
          }}
          error={selectedPerkGroupError != ''}
        >
          <MenuItem value="" disabled>
            Select Perk Group
          </MenuItem>
          {groupData.map((name) => (
            <MenuItem value={name} key={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </DialogContent>
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
    </Dialog>
  );
};

export default AddEmployees;
