import { Grid, Typography } from '@material-ui/core';
import { AddRemoveTable } from 'components/AddRemoveTable';
import Header from 'components/Header';
import { BusinessContext, LoadingContext } from 'contexts';
import { AuthContext } from 'contexts/Auth';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { allPerksDict } from 'shared';
import AddEmployees from './AddEmployees';
import AddPerks from './AddPerks';
import RemoveEmployees from './RemoveEmployees';
import RemovePerks from './RemovePerks';

const columns = [
  {
    field: 'email',
    headerName: 'Email',
    width: 300,
    editable: false,
  },
];

const perkColumns = [
  {
    field: 'Name',
    headerName: 'Perk Name',
    width: 150,
    editable: false,
  },
  {
    field: 'Cost',
    headerName: 'Cost',
    width: 150,
    editable: false,
  },
  {
    field: 'Period',
    headerName: 'Period',
    width: 150,
    editable: false,
  },
];

export default function ManageGroups(props: any) {
  let { id } = useParams<{ id: string }>();

  const [isRemoveEmployeesModalVisible, setIsRemoveEmployeesModalVisible] =
    useState(false);
  const [isAddEmployeesModalVisible, setIsAddEmployeesModalVisible] =
    useState(false);

  const [isRemovePerksModalVisible, setIsRemovePerksModalVisible] =
    useState(false);
  const [isAddPerksModalVisible, setIsAddPerksModalVisible] = useState(false);
  const [groupNotFound, setGroupNotFound] = useState(false);

  const [selectedPerks, setSelectedPerks] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [groupPerks, setPerksData] = useState([]);

  const { business, employees } = useContext(BusinessContext);

  const [groupEmails, setEmails] = useState([]);
  const { currentUser, admin } = useContext(AuthContext);
  const { dashboardLoading, setDashboardLoading, freezeNav, setFreezeNav } =
    useContext(LoadingContext);

  const [perkGroupName, setPerkGroupName] = useState('');

  useEffect(() => {
    if (business) {
      if (Object.keys(business.perkGroups).includes(id)) {
        setPerkGroupName(business.perkGroups[id].perkGroupName);
        // set perk group data
        setPerksData(
          business.perkGroups[id].perkNames.map((perkName, index) => ({
            ...allPerksDict[perkName],
            id: index,
          }))
        );

        setGroupNotFound(false);
      } else {
        setGroupNotFound(true);
      }
      setSelectedPerks([]);
    }
  }, [business, id]);

  useEffect(() => {
    if (employees && business && business.perkGroups[id]) {
      // set email data

      const employeeIDsInPerkGroup = business.perkGroups[id].employeeIDs;

      setEmails(
        employees
          .filter((employee) =>
            employeeIDsInPerkGroup.includes(employee.employeeID)
          )
          .map((employee, index) => ({
            email: employee.email,
            id: index,
            employeeID: employee.employeeID,
          }))
      );
      setSelectedEmployees([]);
    }
  }, [id, employees, business]);

  if (groupNotFound) {
    return (
      <>
        {/* <Header
          title={`Manage ${
            business && business.perkGroups[id].perkGroupName
          } Group`}
          crumbs={[
            'Dashboard',
            'Perk Groups',
            business && business.perkGroups[id].perkGroupName,
          ]}
        /> */}
        <div style={{ width: '50%', marginTop: '100px' }}>
          <Typography variant="h2">Perk Group Not Found</Typography>
          <Typography variant="h5" style={{ marginTop: '20px' }}>
            The perk group could not be found. Please email
            contact@getperkify.com if you think this is an error
          </Typography>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={`Manage ${perkGroupName} Group`}
        crumbs={['Dashboard', 'Perk Groups', perkGroupName]}
        // button={{
        //   type: 'delete',
        //   onClick: () => {
        //     setIsDeletePerkGroupModalVisible(true);
        //   },
        // }}
      />

      <Grid container spacing={5}>
        <Grid item md={6} sm={12}>
          <AddRemoveTable
            rows={groupPerks}
            height={600}
            columns={perkColumns}
            selectedRows={selectedPerks}
            setSelectedRows={setSelectedPerks}
            onClickAdd={() => {
              setIsAddPerksModalVisible(true);
            }}
            onClickDelete={() => {
              setIsRemovePerksModalVisible(true);
            }}
            tableName="Group Perks"
            addButtonText="Add Perks"
            loading={dashboardLoading}
          />
        </Grid>
        <Grid item md={6} sm={12}>
          <AddRemoveTable
            height={600}
            rows={groupEmails}
            columns={columns}
            selectedRows={selectedEmployees}
            setSelectedRows={setSelectedEmployees}
            onClickAdd={() => {
              setIsAddEmployeesModalVisible(true);
            }}
            onClickDelete={() => {
              setIsRemoveEmployeesModalVisible(true);
            }}
            tableName="Group Employees"
            addButtonText="Add Employees"
            loading={dashboardLoading}
          />
        </Grid>
      </Grid>

      <AddEmployees
        isAddEmployeesModalVisible={isAddEmployeesModalVisible}
        setIsAddEmployeesModalVisible={setIsAddEmployeesModalVisible}
        group={id}
        groupEmployees={groupEmails}
        groupPerks={groupPerks}
      />
      <RemoveEmployees
        isRemoveEmployeesModalVisible={isRemoveEmployeesModalVisible}
        setIsRemoveEmployeesModalVisible={setIsRemoveEmployeesModalVisible}
        selectedEmployees={selectedEmployees}
        setSelectedEmployees={setSelectedEmployees}
        group={id}
        employees={groupEmails}
      />

      <AddPerks
        isAddPerksModalVisible={isAddPerksModalVisible}
        setIsAddPerksModalVisible={setIsAddPerksModalVisible}
        groupPerks={groupPerks}
        group={id}
        emails={groupEmails}
      />
      <RemovePerks
        isRemovePerksModalVisible={isRemovePerksModalVisible}
        setIsRemovePerksModalVisible={setIsRemovePerksModalVisible}
        selectedPerks={selectedPerks}
        setSelectedPerks={setSelectedPerks}
        groupPerks={groupPerks}
        group={id}
        emails={groupEmails}
      />
    </>
  );
}
