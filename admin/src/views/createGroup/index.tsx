import {
  Button,
  Card,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import InfoIcon from '@material-ui/icons/Info';
import Header from 'components/Header';
import PurchaseConfirmation from 'components/PurchaseConfirmation';
import { AuthContext, BusinessContext, LoadingContext } from 'contexts';
import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { PerkifyApi } from 'services';
import { allPerks, allPerksDict } from 'shared';
import { validateEmails } from 'utils/emailValidation';

const CreateGroup = () => {
  const history = useHistory();
  const [availablePerks, setAvailablePerks] = useState(
    allPerks.map((perkObj) => perkObj.Name)
  );
  const { dashboardLoading, setDashboardLoading, freezeNav, setFreezeNav } =
    useContext(LoadingContext);

  const { business } = useContext(BusinessContext);

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

  const [isConfirmationModalVisible, setConfirmationModalVisible] =
    useState(false);

  function roundNumber(num: number) {
    return Math.round(100 * num) / 100;
  }

  const handlePerkChange = (event: any) => {
    // update the controlled form
    const perks = event.target.value as string[];

    setSelectedPerksError('');

    setSelectedPerks(perks);

    let cost = 0;
    perks.forEach((perk) => {
      cost += allPerksDict[perk]['Cost'];
    });
    setCostPerPerson(cost);
    setTotalCost(roundNumber(cost * numPeople * 1.1 + 3.99 * numPeople));
  };

  const handleEmailError = (event: any) => {
    setEmails(event.target.value);
    if (event.target.value === '') {
      setEmailsError('Please input at least one email');
    } else if (!validateEmails(event.target.value)) {
      setEmailsError('Please input proper emails');
    } else {
      setEmailsError('');
    }
  };

  const handleEmailChange = (event: any) => {
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
    setTotalCost(
      roundNumber(tmpNumPeople * costPerPerson * 1.1 + tmpNumPeople * 3.99)
    );
  };

  const createPerkGroup = (e: any) => {
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
      setDashboardLoading(true);
      setFreezeNav(true);
      const emailList = emails.replace(/[,'"]+/gi, ' ').split(/\s+/); //Gives email as a list
      (async () => {
        const bearerToken = await currentUser.getIdToken();
        // call the api to create the group
        const payload: CreatePerkGroupPayload = {
          userEmails: emailList,
          perkNames: selectedPerks,
        };
        PerkifyApi.post(`rest/perkGroup/${groupName}`, payload, {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
          },
        })
          .then(() => {
            setDashboardLoading(false);
            setFreezeNav(false);
            history.push(`/dashboard/group/${groupName}`);
          })
          .catch((err) => {
            console.error(err);
          });
      })();
    }
  };

  function setVisible() {
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
    if (error) {
      return;
    }
    setConfirmationModalVisible(true);
  }

  const HtmlTooltip = withStyles((theme) => ({
    tooltip: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 300,
      fontSize: theme.typography.pxToRem(15),
      border: '1px solid #dadde9',
    },
  }))(Tooltip);

  return (
    <div
      style={dashboardLoading ? { pointerEvents: 'none', opacity: '0.4' } : {}}
    >
      <PurchaseConfirmation
        isAddPerksModalVisible={isConfirmationModalVisible}
        setIsAddPerksModalVisible={setConfirmationModalVisible}
        title={'Create Group'}
        text={
          'Are you sure you want to create this group for a total cost of $'
        }
        onConfirmation={createPerkGroup}
        setConfirmationModalVisible={setConfirmationModalVisible}
        perks={selectedPerks}
        numPeople={numPeople}
        creatingGroup={true}
      />

      {business && Object.keys(business.perkGroups).length === 0 ? (
        <Header
          title="Create Group"
          crumbs={['Dashboard', 'Perk Groups', 'Create Group']}
        />
      ) : (
        <Header
          title="Create Group"
          crumbs={['Dashboard', 'Perk Groups', 'Create Group']}
          icon={
            <HtmlTooltip
              title={
                <React.Fragment>
                  <p
                    style={{
                      paddingTop: 3,
                      paddingBottom: 3,
                      paddingLeft: 5,
                      paddingRight: 5,
                    }}
                  >
                    Perkify uses Groups to manage the different subscriptions
                    you'd like to give to different employees. Just give your
                    group a name, select the people that you'd like to have in
                    the group, and choose the perks you want to give that group
                    access to.
                  </p>
                </React.Fragment>
              }
              placement="bottom"
            >
              <IconButton>
                <InfoIcon></InfoIcon>
              </IconButton>
            </HtmlTooltip>
          }
        />
      )}
      <Card
        style={{
          width: 700,
          padding: 30,
          marginTop: 30,
        }}
        elevation={4}
      >
        {/* <Typography variant="body2" color="textSecondary" component="p">
            Create a perk group
            
          </Typography> */}
        {business && Object.keys(business.perkGroups).length === 0 && (
          <Card
            style={{
              width: 650,
              marginBottom: '15px',
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 10,
              paddingBottom: 10,
              backgroundColor: '#e6edff',
            }}
            elevation={4}
          >
            <p>
              {' '}
              Perkify uses Groups to manage the different subscriptions you'd
              like to give to different employees. Just give your group a name,
              select the people that you'd like to have in the group, and choose
              the perks you want to give that group access to.
            </p>
          </Card>
        )}

        <Typography style={{ marginBottom: '15px' }}>Group Name</Typography>
        <TextField
          id="group_name"
          variant="outlined"
          label="Group Name"
          placeholder="Managers"
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
          onChange={handlePerkChange}
          error={selectedPerksError != ''}
        >
          {availablePerks.map((name) => (
            <MenuItem value={name} key={name}>
              {name +
                ' (' +
                allPerksDict[name].Cost +
                '/' +
                allPerksDict[name].Period +
                ')'}
            </MenuItem>
          ))}
        </Select>
        {/* {selectedGroupError != "" && (
          <FormHelperText>{selectedGroupError}</FormHelperText>
        )} */}

        <Typography style={{ marginTop: '30px', marginBottom: '15px' }}>
          Estimated Cost (Fees Included): ${totalCost}
        </Typography>
        <Tooltip
          disableFocusListener={
            !(!business || business.cardPaymentMethods.length == 0)
          }
          disableHoverListener={
            !(!business || business.cardPaymentMethods.length == 0)
          }
          title="Please add billing information before creating a group"
          placement="bottom-start"
        >
          <span>
            <Button
              onClick={setVisible}
              variant="contained"
              color="primary"
              disabled={!business || business.cardPaymentMethods.length == 0}
            >
              Create Perk Group
            </Button>
          </span>
        </Tooltip>
      </Card>
    </div>
  );
};

export default CreateGroup;
