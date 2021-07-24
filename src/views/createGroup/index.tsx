import {
  Button,
  Card,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core';
import Header from 'components/Header';
import { AuthContext } from 'contexts';
import { db } from 'firebaseApp';
import React, { useContext, useEffect, useState } from 'react';
import { PerkifyApi } from 'services';
import { validateEmails } from 'utils/emailValidation';
import { allPerks, allPerksDict } from '../../constants';

const CreateGroup = ({ history }) => {
  const [availablePerks, setAvailablePerks] = useState(
    allPerks.map((perkObj) => perkObj.Name)
  );
  const [numPeople, setNumPeople] = useState(0);
  const [costPerPerson, setCostPerPerson] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const { currentUser } = useContext(AuthContext);

  const [groupName, setGroupName] = useState('');
  const [emails, setEmails] = useState('');
  const [selectedPerks, setSelectedPerks] = useState([]);

  const [groupNameError, setGroupNameError] = useState('');
  const [emailsError, setEmailsError] = useState('');
  const [selectedPerksError, setSelectedPerksError] = useState('');

  const [hasPaymentMethods, setHasPaymentMethods] = useState(false);

  useEffect(() => {
    if (currentUser) {
      (async () => {
        const customerDoc = await db
          .collection('customers')
          .doc(currentUser.uid)
          .get();
        const customerData = customerDoc.data();
        const cardPaymentMethods = await PerkifyApi.post(
          '/user/stripePaymentMethods',
          {
            customer: customerData.stripeId,
            type: 'card',
          }
        );
        if (cardPaymentMethods.data.data.length > 0) {
          setHasPaymentMethods(true);
        }
      })();
    }
  }, [currentUser]);

  const handlePerkChange = (event) => {
    // update the controlled form
    const perks = event.target.value as string[];

    setSelectedPerksError('');

    setSelectedPerks(perks);

    let cost = 0;
    perks.forEach((perk) => {
      cost += allPerksDict[perk]['Cost'];
    });
    setCostPerPerson(cost);
    setTotalCost(cost * numPeople);
  };

  const handleEmailError = (event) => {
    setEmails(event.target.value);
    if (event.target.value === '') {
      setEmailsError('Please input at least one email');
    } else if (!validateEmails(event.target.value)) {
      setEmailsError('Please input proper emails');
    } else {
      setEmailsError('');
    }
  };

  const handleEmailChange = (event) => {
    handleEmailError(event);
    let tmpNumPeople = numPeople;
    if (event.target.value === '') {
      // if empty, set num people to 0
      tmpNumPeople = 0;
    } else if (!validateEmails(event.target.value)) {
      // if error, leave it the same as it was before
      // user is typing
    } else {
      // if not error, update the number of people
      const emails = event.target.value.replace(/[,'"]+/gi, ' ').split(/\s+/);
      tmpNumPeople = emails.length;
    }
    // update the number of people and total cost
    setNumPeople(tmpNumPeople);
    setTotalCost(tmpNumPeople * costPerPerson);
  };

  const createPerkGroup = (e) => {
    e.preventDefault();
    let error = false;

    if (groupName == '') {
      setGroupNameError('Enter a group name');
      error = true;
    }

    if (emails == '') {
      setEmailsError('Please input at least one email');
      error = true;
    } else if (!validateEmails(emails)) {
      setEmailsError('Please input proper emails');
      error = true;
    }

    if (selectedPerks.length == 0) {
      setSelectedPerksError('Select perks');
      error = true;
    }

    if (!error) {
      console.log('No errors');
      const emailList = emails.replace(/[,'"]+/gi, ' ').split(/\s+/); //Gives email as a list
      (async () => {
        const bearerToken = await currentUser.getIdToken();
        console.log(bearerToken);
        // call the api to create the group
        PerkifyApi.post(
          'user/auth/createGroup',
          {
            group: groupName,
            emails: emailList,
            perks: selectedPerks,
          },

          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
          .then(() => {
            history.push(`/dashboard/group/${groupName}`);
          })
          .catch((err) => {
            console.log(err);
          });
      })();
    }
  };

  return (
    <>
      <Header
        title="Create Group"
        crumbs={['Dashboard', 'Perk Groups', 'Create Group']}
      />

      <Card style={{ width: 700, padding: 30, marginTop: 30 }} elevation={4}>
        {/* <Typography variant="body2" color="textSecondary" component="p">
            Create a perk group
          </Typography> */}
        <Typography style={{ marginBottom: '15px' }}>Group Name</Typography>
        <TextField
          id="group_name"
          variant="outlined"
          label="Group Name"
          placeholder="Cole's Group"
          value={groupName}
          onChange={(event) => {
            setGroupName(event.target.value);
            setGroupNameError('');
          }}
          fullWidth
          error={groupNameError != ''}
          helperText={groupNameError}
        />
        <Typography style={{ marginTop: '30px', marginBottom: '15px' }}>
          Emails
        </Typography>
        <TextField
          id="emailaddresses"
          variant="outlined"
          label=""
          placeholder="Insert emails separated by commas or newlines"
          value={emails}
          onChange={handleEmailChange}
          fullWidth
          multiline
          rows={4}
          maxRows={4}
          error={emailsError != ''}
          helperText={emailsError}
        />
        <Typography style={{ marginTop: '30px', marginBottom: '15px' }}>
          Perks
        </Typography>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          displayEmpty
          renderValue={(selected) => {
            if ((selected as string[]).length === 0) {
              return 'Select Perks';
            }

            return (selected as string[]).join(', ');
          }}
          variant="outlined"
          value={selectedPerks}
          multiple
          fullWidth
          label="Select Group"
          placeholder="Select Gruop"
          onChange={handlePerkChange}
          error={selectedPerksError != ''}
        >
          {availablePerks.map((name) => (
            <MenuItem value={name} key={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
        {/* {selectedGroupError != "" && (
          <FormHelperText>{selectedGroupError}</FormHelperText>
        )} */}

        <Typography style={{ marginTop: '30px', marginBottom: '15px' }}>
          Estimated Cost: ${totalCost}
        </Typography>
        <Button
          onClick={createPerkGroup}
          variant="contained"
          color="primary"
          disabled={!hasPaymentMethods}
        >
          Create Perk Group
        </Button>
      </Card>
    </>
  );
};

export default CreateGroup;
