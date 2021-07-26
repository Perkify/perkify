import { MenuItem, Select, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import { AddRemoveTable } from 'components/AddRemoveTable';
import Header from 'components/Header';
import { AuthContext, BusinessContext, LoadingContext } from 'contexts';
import { db } from 'firebaseApp';
import React, { useContext, useEffect, useState } from 'react';
import { PerkifyApi } from 'services';
import { validateEmails } from 'utils/emailValidation';

const columns = [
  {
    field: 'email',
    headerName: 'Email',
    width: 300,
    editable: false,
  },
  {
    field: 'group',
    headerName: 'Group',
    width: 200,
    editable: false,
  },
];

export default function ManagePeople(props) {
  const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedUsers, setSelection] = useState([]);
  const [selectedPerkGroup, setSelectedPerkGroup] = useState([]);
  const [emails, setEmails] = useState('');
  const [emailsError, setEmailsError] = useState('');
  const [selectedPerksError, setSelectedPerksError] = useState('');

  const handleOk = () => {
    setIsRemoveModalVisible(false);
    setIsAddModalVisible(false);
  };

  const handleCancel = () => {
    setIsRemoveModalVisible(false);
    setIsAddModalVisible(false);
  };

  function getRemovedUserEmails() {
    var removedUsers: any[] = [];
    selectedUsers.forEach((index) => {
      removedUsers.push(peopleData[index].email);
    });
    return removedUsers;
  }

  const [peopleData, setPeopleData] = useState<any[]>([]);
  const { currentUser, admin } = useContext(AuthContext);
  const { business } = useContext(BusinessContext);
  const { dashboardLoading, setDashboardLoading } = useContext(LoadingContext);
  const [groupData, setGroupData] = useState([]);

  useEffect(() => {
    if (business && business['groups']) {
      setGroupData(Object.keys(business['groups']).sort());
    }
  }, [business]);

  useEffect(() => {
    setDashboardLoading(true);
    // get list of employees that belong to the business
    if (Object.keys(admin).length != 0) {
      db.collection('users')
        .where('businessID', '==', admin.companyID)
        .get()
        .then((querySnapshot) => {
          setPeopleData(
            querySnapshot.docs.map((doc, index) => ({
              email: doc.id,
              id: index,
              group: doc.data()['group'],
            }))
          );
          setDashboardLoading(false);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [admin]);

  const handleEmailError = (event) => {
    setEmails(event.target.value);
    if (event.target.value === '') {
      setEmailsError('Please input atleast one email');
    } else if (!validateEmails(event.target.value)) {
      setEmailsError('Please input proper emails');
    } else {
      setEmailsError('');
    }
  };

  const addToPerkGroup = (event) => {
    event.preventDefault();
    let error = false;
    if (emails == '') {
      setEmailsError('Enter emails');
      error = true;
    }
    if (selectedPerkGroup.length == 0) {
      setSelectedPerksError('Select perks');
      error = true;
    }
    if (!error) {
      setIsAddModalVisible(false);

      (async () => {
        const bearerToken = await currentUser.getIdToken();

        const emailList = emails.replace(/[,'"]+/gi, ' ').split(/\s+/); //Gives email as a list

        await PerkifyApi.put(
          'user/auth/updatePerkGroup',
          JSON.stringify({
            group: selectedPerkGroup,
            perks: [],
            emails: emailList.concat(
              peopleData
                .filter((employeeObj) => employeeObj.group == selectedPerkGroup)
                .map((employeeObj) => employeeObj.email)
            ),
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
    <>
      <Header
        title="Manage Employees"
        crumbs={['Dashboard', 'People', 'Employees']}
      />

      <AddRemoveTable
        rows={peopleData}
        columns={columns}
        setSelected={setSelection}
        height={500}
        onClickAdd={() => setIsAddModalVisible(true)}
        onClickDelete={() => {
          setIsRemoveModalVisible(true);
        }}
        tableName="Employees"
        addButtonText="Add Employees"
      />
      <Dialog
        open={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Add Users</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To add users to this organization, please enter their email
            addresses below and select a group from the dropdown.
          </DialogContentText>
          <Typography style={{ marginTop: '30px', marginBottom: '15px' }}>
            Emails
          </Typography>
          <TextField
            id="emailaddresses"
            variant="outlined"
            label=""
            placeholder="Insert emails separated by commas or newlines"
            value={emails}
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
              setSelectedPerksError('');
              setSelectedPerkGroup(event.target.value as string[]);
            }}
            error={selectedPerksError != ''}
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
          <Button onClick={() => setIsAddModalVisible(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={addToPerkGroup} color="primary">
            Add Users
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isRemoveModalVisible}
        onClose={() => setIsRemoveModalVisible(false)}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Delete Users</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete these users? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsRemoveModalVisible(false)}
            color="primary"
          >
            No
          </Button>
          <Button
            onClick={() => setIsRemoveModalVisible(false)}
            color="primary"
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
