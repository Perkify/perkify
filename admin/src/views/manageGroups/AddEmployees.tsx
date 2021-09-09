import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Theme,
  Typography,
} from '@material-ui/core';
import InputBase from '@material-ui/core/InputBase';
import { alpha, createStyles, makeStyles } from '@material-ui/core/styles';
import { DataGrid } from '@material-ui/data-grid';
import SearchIcon from '@material-ui/icons/Search';
import PurchaseConfirmation from 'components/PurchaseConfirmation';
import { AuthContext, BusinessContext, LoadingContext } from 'contexts';
import React, { useContext, useEffect, useState } from 'react';
import { PerkifyApi } from 'services';
import { validateEmails } from 'utils/emailValidation';

interface AddEmployeesProps {
  isAddEmployeesModalVisible: boolean;
  setIsAddEmployeesModalVisible: (arg0: boolean) => void;
  groupEmployees: {
    email: string;
    group: string;
    id: string;
    employeeID: string;
  }[];
  group: string;
  groupPerks: PerkDefinition[];
}

const useDataGridStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      border: 'none',
      // padding: "10px 20px",
    },
  })
);
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

const AddEmployees = ({
  isAddEmployeesModalVisible,
  setIsAddEmployeesModalVisible,
  groupEmployees,
  group,
  groupPerks,
}: AddEmployeesProps) => {
  const { business, employees } = useContext(BusinessContext);
  const dataGridClasses = useDataGridStyles();

  const [emailsToAdd, setEmailsToAdd] = useState('');
  const [selectedUsers, setSelection] = useState([]);
  const [emailsError, setEmailsError] = useState('');
  const [isConfirmationModalVisible, setConfirmationModalVisible] =
    useState(false);
  const classes = useStyles();

  const { dashboardLoading, setDashboardLoading, freezeNav, setFreezeNav } =
    useContext(LoadingContext);

  const { currentUser } = useContext(AuthContext);
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

  const addEmployeesToPerkGroup = (event: any) => {
    event.preventDefault();
    let error = false;
    console.log(employees);
    if (!error) {
      (async () => {
        setConfirmationModalVisible(false);
        setIsAddEmployeesModalVisible(false);
        setDashboardLoading(true);
        setFreezeNav(true);
        const bearerToken = await currentUser.getIdToken();

        groupEmployees.forEach((groupEmployee) => {
          selectedUsers.push(groupEmployee.email);
        });
        console.log(selectedUsers);
        let afterEmployeeIds: any[] = [];
        employees.forEach((employee) => {
          if (selectedUsers.includes(employee.email)) {
            afterEmployeeIds.push(employee.employeeID);
          }
        });
        console.log('printing after employee ids', afterEmployeeIds);

        const payload: UpdatePerkGroupPayload = {
          perkNames: groupPerks.map((perkObj) => perkObj.Name),
          employeeIDs: afterEmployeeIds,
          perkGroupName: business.perkGroups[group].perkGroupName,
        };

        PerkifyApi.put(`rest/perkGroup/${group}`, payload, {
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
            setConfirmationModalVisible(false);
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

  const columns = [
    {
      field: 'email',
      headerName: 'Email',
      width: 300,
      editable: false,
    },
  ];

  useEffect(() => {
    if (employees) {
      setEmployeesData(
        employees
          .map((employee) => ({ ...employee, id: employee.email }))
          .filter((employee) => !('perkGroupID' in employee))
      );
      setSelection([]);
      setPreSearch(
        employees
          .map((employee) => ({ ...employee, id: employee.email }))
          .filter((employee) => !('perkGroupID' in employee))
      );
    }
  }, [employees]);

  const [employeesData, setEmployeesData] = useState([]);
  const [employeeSearchValue, setEmployeeSearchState] = useState('');
  let [preSearch, setPreSearch] = useState([]);
  function escapeRegExp(value: any) {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

  const requestSearch = (searchValue: string) => {
    setEmployeeSearchState(searchValue);
    const searchRegex = new RegExp(escapeRegExp(searchValue), 'i');
    const filteredRows = preSearch.filter((row: any) => {
      return Object.keys(row).some((field) => {
        return searchRegex.test(row[field].toString());
      });
    });
    setEmployeesData(filteredRows);
  };

  function setVisible() {
    let error = false;
    if (selectedUsers.length === 0) {
      setEmailsError('Enter emails');
      return;
    }
    setConfirmationModalVisible(true);
  }

  function generatePerks() {
    return groupPerks.map((perk) => perk.Name);
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
      numPeople={selectedUsers.length}
      creatingGroup={true}
    />
  ) : (
    <Dialog
      open={isAddEmployeesModalVisible}
      onClose={() => {
        setIsAddEmployeesModalVisible(false);
        setSelection([]);
        setEmployeeSearchState('');
        setEmployeesData(preSearch);
      }}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Add Employees</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To add employees to this perk group, please select them from the
          employees below.
        </DialogContentText>
        <Typography style={{ marginTop: '30px', marginBottom: '15px' }}>
          Employees
        </Typography>
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
            style={{ width: '100%' }}
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
        <DialogActions>
          <Button
            onClick={() => {
              setIsAddEmployeesModalVisible(false);
              setSelection([]);
              setEmployeeSearchState('');
              console.log(preSearch);
              setEmployeesData(preSearch);
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button onClick={setVisible} color="primary">
            Add Employees
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployees;
