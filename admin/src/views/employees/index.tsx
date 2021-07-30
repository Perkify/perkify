import { AddRemoveTable } from 'components/AddRemoveTable';
import ConfirmationModal from 'components/ConfirmationModal';
import Header from 'components/Header';
import { AuthContext, BusinessContext, LoadingContext } from 'contexts';
import { db } from 'firebaseApp';
import React, { useContext, useEffect, useState } from 'react';
import { PerkifyApi } from 'services';
import AddEmployees from './AddEmployees';

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
  const [isAddEmployeesModalVisible, setIsAddEmployeesModalVisible] =
    useState(false);
  const [selectedUsers, setSelection] = useState([]);

  const [peopleData, setPeopleData] = useState<any[]>([]);
  const { currentUser, admin } = useContext(AuthContext);
  const { business } = useContext(BusinessContext);
  const { dashboardLoading, setDashboardLoading, freezeNav, setFreezeNav } =
    useContext(LoadingContext);
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
        .onSnapshot(
          (querySnapshot) => {
            setPeopleData(
              querySnapshot.docs.map((doc, index) => ({
                email: doc.id,
                id: index,
                group: doc.data()['group'],
              }))
            );
            setDashboardLoading(false);
          },
          (error) => {
            console.error(error);
          }
        );
      // .catch((error) => {
      //   console.error(error);
      // });
    }
  }, [admin]);

  const removeUsers = async () => {
    let error = false;

    if (!error) {
      await (async () => {
        setDashboardLoading(true);
        setFreezeNav(true);
        const bearerToken = await currentUser.getIdToken();
        // get all employees that are not selected
        // by removing all employees that were selected
        const afterEmployees = peopleData.filter(
          (employee, index) => selectedUsers.indexOf(index) == -1
        );

        const perkGroupToAfterEmails = afterEmployees.reduce(
          (accumulator, employeeObj) => {
            if (accumulator[employeeObj.group] != null) {
              accumulator[employeeObj.group].push(employeeObj.email);
            } else {
              accumulator[employeeObj.group] = [employeeObj.email];
            }
            return accumulator;
          },
          {}
        );

        await Promise.all(
          Object.keys(perkGroupToAfterEmails).map(async (perkGroup) => {
            const afterEmails = perkGroupToAfterEmails[perkGroup];

            await PerkifyApi.put(
              'user/auth/updatePerkGroup',
              JSON.stringify({
                group: perkGroup,
                emails: afterEmails,
                perks: undefined,
              }),
              {
                headers: {
                  Authorization: `Bearer ${bearerToken}`,
                  'Content-Type': 'application/json',
                },
              }
            );
          })
        );
        setDashboardLoading(false);
        setFreezeNav(false);
        setIsRemoveModalVisible(false);
        setSelection([]);
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
        height={500}
        onClickAdd={() => setIsAddEmployeesModalVisible(true)}
        onClickDelete={() => {
          setIsRemoveModalVisible(true);
        }}
        tableName="Employees"
        addButtonText="Add Employees"
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
