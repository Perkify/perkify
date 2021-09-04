import {
  Button,
  Card,
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
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import AddIcon from '@material-ui/icons/Add';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import Header from 'components/Header';
import PurchaseConfirmation from 'components/PurchaseConfirmation';
import { AuthContext, BusinessContext, LoadingContext } from 'contexts';
import 'datasheet.css';
import { DropzoneArea } from 'material-ui-dropzone';
import React, { useContext, useState } from 'react';
import ReactDataSheet from 'react-datasheet';
//import 'react-datasheet/lib/react-datasheet.css';
import { useHistory } from 'react-router-dom';
import { PerkifyApi } from 'services';
import { allPerks, allPerksDict } from 'shared';
import { validateEmail, validateEmails } from 'utils/emailValidation';

export interface GridElement extends ReactDataSheet.Cell<GridElement, string> {
  value: string;
}

class MyReactDataSheet extends ReactDataSheet<GridElement, string> {}

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
  const [isShowingBulkAdd, setIsShowingBulkAdd] = useState(false);

  const [enteredEmployees, setEnteredEmployees] = useState([
    {
      name: '',
      email: '',
      taxId: '',
      nameError: '',
      emailError: '',
      taxIdError: '',
    },
  ]);

  const [groupNameError, setGroupNameError] = useState('');
  const [emailsError, setEmailsError] = useState('');
  const [selectedPerksError, setSelectedPerksError] = useState('');
  const [isADPIntegrationVisible, setIsADPIntegrationVisible] = useState(false);
  const [gridState, setGridState] = useState([]);
  const [isManualIntegrationVisible, setIsManualIntegrationVisible] =
    useState(false);

  const [isConfirmationModalVisible, setConfirmationModalVisible] =
    useState(false);

  function roundNumber(num: number) {
    return Math.round(100 * num) / 100;
  }

  function setADPModalVisible() {
    setIsADPIntegrationVisible(true);
  }

  function addEnteringEmployee() {
    setEnteredEmployees(
      enteredEmployees.concat({
        email: '',
        name: '',
        taxId: '',
        nameError: '',
        emailError: '',
        taxIdError: '',
      })
    );
  }

  function setManualModalVisible() {
    setIsManualIntegrationVisible(true);
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

  function returnEmailError(emailInput: string) {
    if (emailInput === '') {
      return 'Please input a proper email';
    } else if (!validateEmail(emailInput.trim())) {
      return 'Please input a proper email';
    } else {
      return '';
    }
  }

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
      const emails = event.target.value
        .trim()
        .replace(/[,'"]+/gi, ' ')
        .split(/\s+/)
        .filter((item: any) => item);
      tmpNumPeople = emails.length;
    }
    // update the number of people and total cost
    setNumPeople(tmpNumPeople);
    setTotalCost(
      roundNumber(tmpNumPeople * costPerPerson * 1.1 + tmpNumPeople * 3.99)
    );
  };

  if (gridState.length === 0) {
    let grid: GridElement[][] = [
      [
        { readOnly: true, value: '' },
        { value: 'Employee Email', readOnly: true },
        { value: 'Name', readOnly: true },
        { value: 'Tax Id', readOnly: true },
      ],
    ];
    for (let i = 0; i < 50; i++) {
      grid.push([
        { readOnly: true, value: i.toString() },
        { value: '' },
        { value: '' },
        { value: '' },
      ]);
    }
    setGridState(grid);
  }

  const createPerkGroup = (event: any) => {
    event.preventDefault();
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
      const emailList = emails
        .trim()
        .replace(/[,'"]+/gi, ' ')
        .split(/\s+/); //Gives email as a list
      (async () => {
        setConfirmationModalVisible(false);
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
            console.error(err.response);

            setDashboardLoading(false);
            setFreezeNav(false);

            alert(
              `Error. Reason: ${err.response.data.reason}. Details: ${err.response.data.reasonDetail}`
            );
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

  function onContextMenu(e: any, cell: any, i: any, j: any) {
    return cell.readOnly ? e.preventDefault() : null;
  }

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
            !(!business || Object.keys(business.cardPaymentMethods).length == 0)
          }
          disableHoverListener={
            !(!business || Object.keys(business.cardPaymentMethods).length == 0)
          }
          title="Please add billing information before creating a group"
          placement="bottom-start"
        >
          <span>
            <Button
              onClick={setVisible}
              variant="contained"
              color="primary"
              disabled={
                !business ||
                Object.keys(business.cardPaymentMethods).length == 0
              }
            >
              Create Perk Group
            </Button>
          </span>
        </Tooltip>
      </Card>
      <Grid container spacing={0} style={{ paddingTop: 25 }}>
        <Grid item xs={3}>
          <Button
            onClick={setADPModalVisible}
            variant="contained"
            color="primary"
            disabled={
              !business || Object.keys(business.cardPaymentMethods).length == 0
            }
          >
            Integrate with ADP
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            onClick={setManualModalVisible}
            variant="contained"
            color="primary"
            disabled={
              !business || Object.keys(business.cardPaymentMethods).length == 0
            }
          >
            Add Employees Manually
          </Button>
        </Grid>
      </Grid>

      <Dialog
        open={isManualIntegrationVisible}
        onClose={() => setIsManualIntegrationVisible(false)}
        aria-labelledby="form-dialog-title"
        fullWidth={true}
        maxWidth={'md'}
      >
        <DialogTitle id="form-dialog-title">Manual Integration</DialogTitle>
        {!isShowingBulkAdd ? (
          <DialogContent>
            <DialogContentText>
              If you aren't using any of our supported payroll integration
              systems, please manually enter in employee information below.{' '}
              <Grid container spacing={5} style={{ paddingTop: 50 }}>
                {enteredEmployees.map((employeeInfo, index) => {
                  return (
                    <>
                      {' '}
                      <Grid item xs={4} style={{ paddingTop: 0 }}>
                        <TextField
                          id="employee_email"
                          variant="outlined"
                          label="Employee Email"
                          placeholder="johndoe@gmail.com"
                          value={employeeInfo.email}
                          onChange={(event) => {
                            let copy = [...enteredEmployees];
                            let employeeCopy = enteredEmployees[index];
                            employeeCopy.email = event.target.value;
                            employeeCopy.emailError = returnEmailError(
                              event.target.value
                            );
                            copy[index] = employeeCopy;
                            setEnteredEmployees(copy);
                          }}
                          fullWidth
                          error={employeeInfo.emailError != ''}
                          helperText={employeeInfo.emailError}
                        />
                      </Grid>
                      <Grid item xs={4} style={{ paddingTop: 0 }}>
                        <TextField
                          id="full_name"
                          variant="outlined"
                          label="Full Name"
                          placeholder="John Doe"
                          value={employeeInfo.name}
                          onChange={(event) => {
                            let copy = [...enteredEmployees];
                            let employeeCopy = enteredEmployees[index];
                            employeeCopy.name = event.target.value;
                            copy[index] = employeeCopy;
                            setEnteredEmployees(copy);
                          }}
                          fullWidth
                          error={groupNameError != ''}
                          helperText={groupNameError}
                        />
                      </Grid>
                      <Grid item xs={4} style={{ paddingTop: 0 }}>
                        <TextField
                          id="group_name"
                          variant="outlined"
                          label="Tax Id Number"
                          placeholder="1234"
                          value={employeeInfo.taxId}
                          onChange={(event) => {
                            let copy = [...enteredEmployees];
                            let employeeCopy = enteredEmployees[index];
                            employeeCopy.taxId = event.target.value;
                            copy[index] = employeeCopy;
                            setEnteredEmployees(copy);
                          }}
                          fullWidth
                          error={groupNameError != ''}
                          helperText={groupNameError}
                        />
                      </Grid>{' '}
                    </>
                  );
                })}
                <Grid item xs={10} style={{ paddingTop: 0 }}>
                  <Button
                    onClick={addEnteringEmployee}
                    style={{ padding: 0 }}
                    color="primary"
                  >
                    <AddIcon />
                    <Typography style={{ textTransform: 'none' }}>
                      Add Another Employee
                    </Typography>
                  </Button>
                </Grid>
                <Grid item xs={2} style={{ paddingTop: 0, marginLeft: 'auto' }}>
                  <Button
                    onClick={() => {
                      setIsShowingBulkAdd(true);
                    }}
                    style={{ padding: 0 }}
                    color="primary"
                  >
                    <AddCircleOutlineIcon />
                    <Typography style={{ textTransform: 'none' }}>
                      Bulk Add
                    </Typography>
                  </Button>
                </Grid>
              </Grid>
            </DialogContentText>
            <DialogActions>
              <Button
                onClick={() => {
                  setIsShowingBulkAdd(false);
                  setIsManualIntegrationVisible(false);
                }}
                color="primary"
              >
                Cancel
              </Button>

              <Button
                color="primary"
                onClick={() => {
                  setIsShowingBulkAdd(false);
                }}
              >
                Confirm
              </Button>
            </DialogActions>
          </DialogContent>
        ) : (
          <DialogContent>
            <div className={'sheet-container'}>
              <MyReactDataSheet
                data={gridState}
                valueRenderer={(cell) => cell.value}
                onContextMenu={onContextMenu}
                onCellsChanged={(changes) => {
                  const gridCopy = gridState;
                  changes.forEach(({ cell, row, col, value }) => {
                    gridCopy[row][col] = { ...gridCopy[row][col], value };
                  });
                  setGridState(gridCopy);
                }}
              />
            </div>
            <DialogActions>
              <Button
                onClick={() => {
                  setIsManualIntegrationVisible(false);
                  setIsShowingBulkAdd(false);
                }}
                color="primary"
              >
                Cancel
              </Button>

              <Button
                color="primary"
                onClick={() => {
                  let enteredEmployeesCopy: any[] = [];
                  // let grid: GridElement[][] = [
                  //   [
                  //     { readOnly: true, value: '' },
                  //     { value: 'Name', readOnly: true },
                  //     { value: 'Email', readOnly: true },
                  //     { value: 'Tax Id', readOnly: true },
                  //   ],
                  // ];
                  // for (let i = 0; i < 50; i++) {
                  //   grid.push([
                  //     { readOnly: true, value: i.toString() },
                  //     { value: '' },
                  //     { value: '' },
                  //     { value: '' },
                  //   ]);
                  // }
                  gridState.forEach((row) => {
                    if (row[1].readOnly) {
                      return;
                    } else {
                      if (
                        row[1].value !== '' ||
                        row[2].value !== '' ||
                        row[3].value !== ''
                      ) {
                        const newEmployee = {
                          name: row[2].value,
                          email: row[1].value,
                          taxId: row[3].value,
                          nameError: '',
                          emailError:
                            validateEmail(row[1].value) === false
                              ? 'Please input proper emails'
                              : '',
                          taxIdError: '',
                        };
                        enteredEmployeesCopy.push(newEmployee);
                      }
                    }
                  });
                  setEnteredEmployees(enteredEmployeesCopy);
                  setIsShowingBulkAdd(false);
                }}
              >
                Confirm
              </Button>
            </DialogActions>
          </DialogContent>
        )}
      </Dialog>

      <Dialog
        open={isADPIntegrationVisible}
        onClose={() => setIsADPIntegrationVisible(false)}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">ADP Integration</DialogTitle>
        <DialogContent>
          <DialogContentText>
            We don't currently support direct integration with ADP. Instead,
            please find a spreadsheet of your employees WITH X RULES and upload
            it below.{' '}
            <Grid container spacing={0} style={{ paddingTop: 25 }}>
              <Grid item xs={12}>
                <DropzoneArea
                  onChange={(files) => console.log('Files:', files)}
                  filesLimit={1}
                />
              </Grid>
            </Grid>
          </DialogContentText>
          <DialogActions>
            <Button
              onClick={() => {
                setIsADPIntegrationVisible(false);
              }}
              color="primary"
            >
              Cancel
            </Button>

            <Button color="primary">Confirm</Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateGroup;
