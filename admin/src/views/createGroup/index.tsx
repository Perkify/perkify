import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  MenuItem,
  Select,
  TextField,
  Theme,
  Typography,
} from '@material-ui/core';
import Chip from '@material-ui/core/Chip';
import InputBase from '@material-ui/core/InputBase';
import Paper from '@material-ui/core/Paper';
import { alpha, createStyles, makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import { DataGrid } from '@material-ui/data-grid';
import SearchIcon from '@material-ui/icons/Search';
import Header from 'components/Header';
import PurchaseConfirmation from 'components/PurchaseConfirmation';
import { AuthContext, BusinessContext, LoadingContext } from 'contexts';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { PerkifyApi } from 'services';
import { allPerks, allPerksDict } from 'shared';
import { validateEmails } from 'utils/emailValidation';

const columns = [
  {
    field: 'email',
    headerName: 'Email',
    width: 300,
    editable: false,
  },
];
const useDataGridStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      border: 'none',
      // padding: "10px 20px",
    },
  })
);

const testRows = [{ id: 0, email: 'jerry1ye10@gmail.com' }];

const CreateGroup = () => {
  const dataGridClasses = useDataGridStyles();

  const history = useHistory();
  const [availablePerks, setAvailablePerks] = useState(
    allPerks.map((perkObj) => perkObj.Name)
  );
  const { dashboardLoading, setDashboardLoading, freezeNav, setFreezeNav } =
    useContext(LoadingContext);

  const { business, employees } = useContext(BusinessContext);

  const [numPeople, setNumPeople] = useState(0);
  const [costPerPerson, setCostPerPerson] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const { currentUser } = useContext(AuthContext);

  const [groupName, setGroupName] = useState('');
  const [emails, setEmails] = useState('');
  const [isAddEmployeesModalVisible, setIsAddEmployeesModalVisible] =
    useState(false);
  const [employeesData, setEmployeesData] = useState([]);
  const [selectedPerks, setSelectedPerks] = useState([]);
  const [selectedUsers, setSelection] = useState([]);
  const [employeeSearchValue, setEmployeeSearchState] = useState('');

  const [groupNameError, setGroupNameError] = useState('');
  const [emailsError, setEmailsError] = useState('');
  const [selectedPerksError, setSelectedPerksError] = useState('');

  const handleDelete = (chipToDelete: any) => () => {
    console.log(employeesData);
    console.log(chipToDelete);
    setEmployeeChipData((chips) =>
      chips.filter((chip) => chip.key !== chipToDelete.key)
    );

    let copy = [...employeesData];
    copy.push({
      email: chipToDelete.label,
      group: chipToDelete.label,
      id: chipToDelete.label,
    });
    setEmployeesData(copy);
  };

  const [employeeChipData, setEmployeeChipData] = React.useState([]);

  const [isConfirmationModalVisible, setConfirmationModalVisible] =
    useState(false);

  const useStyles = makeStyles((theme) => ({
    search: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: alpha(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
      },
      marginRight: theme.spacing(2),
      marginLeft: 0,
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(0),
        width: 'auto',
      },
    },
    searchIcon: {
      padding: theme.spacing(0, 2),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputRoot: {
      color: 'inherit',
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('md')]: {
        width: '20ch',
      },
    },
    root: {
      display: 'flex',
      justifyContent: 'left',
      flexWrap: 'wrap',
      listStyle: 'none',
      padding: theme.spacing(0.5),
      margin: 0,
    },
    chip: {
      margin: theme.spacing(0.5),
    },
  }));

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
    setTotalCost(
      roundNumber(
        cost * employeeChipData.length * 1.1 + 3.99 * employeeChipData.length
      )
    );
  };

  function escapeRegExp(value: any) {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

  let [preSearch, setPreSearch] = useState([]);
  const requestSearch = (searchValue: string) => {
    console.log(employeesData);
    setEmployeeSearchState(searchValue);
    const searchRegex = new RegExp(escapeRegExp(searchValue), 'i');
    const filteredRows = preSearch.filter((row: any) => {
      return Object.keys(row).some((field) => {
        return searchRegex.test(row[field].toString());
      });
    });
    setEmployeesData(filteredRows);
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

  const classes = useStyles();

  // const handleEmailChange = (event: any) => {
  //   handleEmailError(event);
  //   let tmpNumPeople = numPeople;
  //   if (event.target.value === '') {
  //     // if empty, set num people to 0
  //     tmpNumPeople = 0;
  //   } else if (!validateEmails(event.target.value)) {
  //     // if error, leave it the same as it was before
  //     // user is typing
  //   } else {
  //     // if not error, update the number of people
  //     const emails = event.target.value
  //       .trim()
  //       .replace(/[,'"]+/gi, ' ')
  //       .split(/\s+/)
  //       .filter((item: any) => item);
  //     tmpNumPeople = emails.length;
  //   }
  //   // update the number of people and total cost
  //   setNumPeople(tmpNumPeople);
  //   setTotalCost(
  //     roundNumber(tmpNumPeople * costPerPerson * 1.1 + tmpNumPeople * 3.99)
  //   );
  // };

  const createPerkGroup = (event: any) => {
    event.preventDefault();
    let error = false;

    if (groupName == '') {
      setGroupNameError('Enter a group name');
      error = true;
    }

    if (employeeChipData.length == 0) {
      setEmailsError('Please input at least one email');
      error = true;
    }

    if (selectedPerks.length == 0) {
      setSelectedPerksError('Select perks');
      error = true;
    }

    if (!error) {
      setDashboardLoading(true);
      setFreezeNav(true);

      const employeeIDList = employeeChipData.map(
        (employeeChip) => employeeChip.employeeID
      );

      (async () => {
        setConfirmationModalVisible(false);
        const bearerToken = await currentUser.getIdToken();
        // call the api to create the group
        const payload: CreatePerkGroupPayload = {
          perkNames: selectedPerks,
          employeeIDs: employeeIDList,
          perkGroupName: groupName,
        };
        PerkifyApi.post(`rest/perkGroup`, payload, {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
          },
        })
          .then((response) => {
            setDashboardLoading(false);
            setFreezeNav(false);
            history.push(`/dashboard/group/${response.data.perkGroupID}`);
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

    if (employeeChipData.length == 0) {
      setEmailsError('Please input at least one email');
      error = true;
    }

    if (selectedPerks.length == 0) {
      setSelectedPerksError('Select perks');
      error = true;
    }
    if (error) {
      console.log(error);
      return;
    }
    setConfirmationModalVisible(true);
  }

  useEffect(() => {
    if (employees) {
      setEmployeesData(
        employees.map((employee) => ({ ...employee, id: employee.email }))
      );
      setSelection([]);
    }
  }, [employees]);

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
        numPeople={employeeChipData.length}
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
          <Grid container spacing={0} alignItems="flex-end">
            <Grid item xs={9}>
              Employees
            </Grid>
            <Grid item xs={3}>
              <Button
                type="submit"
                fullWidth
                color="primary"
                style={{ padding: 0 }}
                onClick={() => {
                  setPreSearch(employeesData);
                  setIsAddEmployeesModalVisible(true);
                }}
              >
                Select Employees
              </Button>
            </Grid>
          </Grid>
        </Typography>
        <Paper
          component="ul"
          className={classes.root}
          style={{ minHeight: 50 }}
        >
          {employeeChipData.map((data) => {
            let icon;

            return (
              <li key={data.key}>
                <Chip
                  icon={icon}
                  label={data.label}
                  onDelete={handleDelete(data)}
                  className={classes.chip}
                />
              </li>
            );
          })}
        </Paper>
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

        <Dialog
          open={isAddEmployeesModalVisible}
          onClose={() => {
            setIsAddEmployeesModalVisible(false);
            setEmployeesData(preSearch);
            setEmployeeSearchState('');
            setSelection([]);
          }}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Select Employees</DialogTitle>
          <DialogContent>
            <DialogContentText>
              To add users to the perk group, please select them from the table
              below.
            </DialogContentText>
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder="Search…"
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                inputProps={{ 'aria-label': 'search' }}
                onChange={(event) => {
                  requestSearch(event.target.value);
                }}
              />
            </div>
            <Card style={{ height: 300, border: 0 }} elevation={4}>
              <DataGrid
                classes={{
                  root: dataGridClasses.root,
                }}
                rows={employeesData}
                columns={columns}
                pageSize={10}
                rowHeight={60}
                headerHeight={60}
                checkboxSelection
                selectionModel={selectedUsers}
                onSelectionModelChange={(selectionModel) => {
                  setSelection(selectionModel);
                }}
                disableColumnFilter={true}
                filterModel={{
                  items: [
                    {
                      columnField: 'email',
                      operatorValue: 'contains',
                      value: employeeSearchValue,
                    },
                  ],
                }}
              />
            </Card>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setIsAddEmployeesModalVisible(false);
                setSelection([]);
                setEmployeeSearchState('');
                setEmployeesData(preSearch);
              }}
              color="primary"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedUsers.length === 0) {
                  return;
                }
                let copy = [...employeeChipData];
                let index = copy.length;
                selectedUsers.forEach((user) => {
                  console.log(user);
                  copy.push({
                    key: index,
                    label: user,
                    employeeID: employees.find(
                      (employee) => employee.email == user
                    ).employeeID,
                  });
                  index += 1;
                });
                setEmployeeChipData(copy);
                setTotalCost(
                  roundNumber(
                    costPerPerson * copy.length * 1.1 + 3.99 * copy.length
                  )
                );
                setIsAddEmployeesModalVisible(false);
                setEmployeeSearchState('');
                setEmployeesData(
                  preSearch.filter((employee) => {
                    return !selectedUsers.includes(employee.email);
                  })
                );
                setSelection([]);
              }}
              color="primary"
            >
              Add Users
            </Button>
          </DialogActions>
        </Dialog>

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
    </div>
  );
};

export default CreateGroup;
