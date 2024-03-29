import { IconButton } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import InfoIcon from '@material-ui/icons/Info';
import { AddRemoveTable } from 'components/AddRemoveTable';
import ConfirmationModal from 'components/ConfirmationModal';
import Header from 'components/Header';
import { AuthContext, BusinessContext, LoadingContext } from 'contexts';
import React, { useContext, useEffect, useState } from 'react';
import { PerkifyApi } from '../../services';
import AddEmployees from './AddEmployees';

const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 300,
    fontSize: theme.typography.pxToRem(15),
    border: '1px solid #dadde9',
  },
}))(Tooltip);

const columns = [
  {
    field: 'email',
    headerName: 'Email',
    width: 300,
    editable: false,
  },
  {
    field: 'perkGroupName',
    headerName: 'Perk Group',
    width: 200,
    editable: false,
  },
  {
    field: 'activated',
    headerName: 'Activated',
    width: 200,
    editable: false,
    renderHeader: () => (
      <div>
        Activated{' '}
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
                Please expect a 2 day delay before we can issue your employees a
                virtual credit card to claim their perks. When a user logs into
                their account, we'll register them as activated.
              </p>
            </React.Fragment>
          }
          placement="bottom"
        >
          <IconButton>
            <InfoIcon></InfoIcon>
          </IconButton>
        </HtmlTooltip>{' '}
      </div>
    ),
  },
];

export default function ManagePeople(props: any) {
  const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false);
  const [isAddEmployeesModalVisible, setIsAddEmployeesModalVisible] =
    useState(false);
  const [selectedUsers, setSelection] = useState([]);

  const [peopleData, setPeopleData] = useState<any[]>([]);
  const { currentUser, admin } = useContext(AuthContext);
  const { business, employees } = useContext(BusinessContext);
  const { dashboardLoading, setDashboardLoading, freezeNav, setFreezeNav } =
    useContext(LoadingContext);
  const [groupData, setGroupData] = useState([]);

  useEffect(() => {
    if (employees) {
      const employeeIDsToPendingPerkGroupName = [].concat(
        ...Object.keys(business.perkGroups).map((perkGroupID) =>
          business.perkGroups[perkGroupID].employeeIDs.map((employeeID) => ({
            employeeID,
            perkGroupName: business.perkGroups[perkGroupID].perkGroupName,
          }))
        )
      );
      setPeopleData(
        employees.map((employee) => ({
          ...employee,
          id: employee.email,
          perkGroupName: employeeIDsToPendingPerkGroupName.find(
            (obj) => obj.employeeID == employee.employeeID
          )
            ? employeeIDsToPendingPerkGroupName.find(
                (obj) => obj.employeeID == employee.employeeID
              ).perkGroupName
            : 'Not assigned',
          activated: 'card' in employee ? 'Yes' : 'No',
        }))
      );
      setSelection([]);
    }
  }, [employees]);

  const removeUsers = async () => {
    let error = false;
    if (!error) {
      await (async () => {
        setDashboardLoading(true);
        setFreezeNav(true);
        const bearerToken = await currentUser.getIdToken();
        const employeeIDs = selectedUsers.map(
          (user) =>
            employees.find((employee) => employee.email == user).employeeID
        );
        const payload: DeleteEmployeesPayload = {
          employeeIDs,
        };
        PerkifyApi.post('rest/employee/delete', payload, {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
          },
        })
          .then((response) => {
            setDashboardLoading(false);
            setFreezeNav(false);
            setIsRemoveModalVisible(false);
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

  return (
    <>
      <Header
        title="Manage Employees"
        crumbs={['Dashboard', 'People', 'Employees']}
      />

      <AddRemoveTable
        rows={peopleData}
        columns={columns}
        selectedRows={selectedUsers}
        setSelectedRows={setSelection}
        height={600}
        onClickAdd={() => setIsAddEmployeesModalVisible(true)}
        onClickDelete={() => {
          setIsRemoveModalVisible(true);
        }}
        tableName="Employees"
        addButtonText="Add Employees"
        addButtonHidden={false}
        loading={dashboardLoading}
      />
      <AddEmployees
        isAddEmployeesModalVisible={isAddEmployeesModalVisible}
        setIsAddEmployeesModalVisible={setIsAddEmployeesModalVisible}
        peopleData={peopleData}
        groupData={groupData}
      />
      <ConfirmationModal
        isModalVisible={isRemoveModalVisible}
        setIsModalVisible={setIsRemoveModalVisible}
        title="Delete Users"
        description="Are you sure you want to delete these users? This cannot be undone."
        onConfirmation={removeUsers}
      />
    </>
  );
}
