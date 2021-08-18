import { AddRemoveTable } from 'components/AddRemoveTable';
import ConfirmationModal from 'components/ConfirmationModal';
import Header from 'components/Header';
import { AuthContext, BusinessContext, LoadingContext } from 'contexts';
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
    field: 'perkGroup',
    headerName: 'Perk Group',
    width: 200,
    editable: false,
  },
];

export default function ManagePeople(props: any) {
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
    if (business) {
      setGroupData(Object.keys(business.perkGroups).sort());
      setPeopleData(
        [].concat(
          ...Object.keys(business.perkGroups).map((perkGroupName) =>
            business.perkGroups[perkGroupName].emails.map((employeeEmail) => ({
              email: employeeEmail,
              group: perkGroupName,
              id: employeeEmail,
            }))
          )
        )
      );
    }
  }, [business]);

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

        // this is not an extensive check.
        if (afterEmployees.length === 0) {
          alert('Error: cannot remove all perks from a perk group');
        }

        await Promise.all(
          Object.keys(perkGroupToAfterEmails).map(async (perkGroup) => {
            const afterEmails = perkGroupToAfterEmails[perkGroup];

            // better would be to create an api folder where you can call these from
            // should haven't to do all this copy pasting
            const payload: UpdatePerkGroupPayload = {
              emails: afterEmails,
              perkNames: business.perkGroups[perkGroup].perkNames,
            };

            await PerkifyApi.put(`rest/perkGroup/${perkGroup}`, payload, {
              headers: {
                Authorization: `Bearer ${bearerToken}`,
                'Content-Type': 'application/json',
              },
            });
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
        height={600}
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
