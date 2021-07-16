import { Grid } from "@material-ui/core";
import { AddRemoveTable } from "components/AddRemoveTable";
import Header from "components/Header";
import { AdminContext, BusinessContext } from "contexts";
import { AuthContext } from "contexts/Auth";
import { db } from "firebaseApp";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PerkifyApi } from "services";
import { allPerksDict } from "../../constants";
import AddEmployees from "./AddEmployees";
import AddPerks from "./AddPerks";
import RemoveEmployees from "./RemoveEmployees";
import RemovePerks from "./RemovePerks";

const columns = [
  {
    field: "email",
    headerName: "Email",
    width: 300,
    editable: false,
  },
];

const perkColumns = [
  {
    field: "Name",
    headerName: "Perk Name",
    width: 150,
    editable: false,
  },
  {
    field: "Cost",
    headerName: "Cost",
    width: 150,
    editable: false,
  },
  {
    field: "Period",
    headerName: "Period",
    width: 150,
    editable: false,
  },
];

export default function ManageGroups() {
  let { id } = useParams();

  const [isRemoveEmployeesModalVisible, setIsRemoveEmployeesModalVisible] =
    useState(false);
  const [isAddEmployeesModalVisible, setIsAddEmployeesModalVisible] =
    useState(false);

  const [isRemovePerksModalVisible, setIsRemovePerksModalVisible] =
    useState(false);
  const [isAddPerksModalVisible, setIsAddPerksModalVisible] = useState(false);

  const [selectedPerks, setSelectedPerks] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [groupPerks, setPerksData] = useState([]);

  const { admin } = useContext(AdminContext);
  const { business } = useContext(BusinessContext);

  function getPerkNames(perks) {
    const retNames = perks.map((perk) => {
      retNames.push(perk.Name);
    });

    return retNames;
  }

  let groupData: any[] = [];
  const fillerGroupData = [
    {
      name: "A",
      id: "abc123",
    },
    {
      name: "B",
      id: "abc133",
    },
  ];

  const deletePerkGroup = () => {
    (async () => {
      const bearerToken = await currentUser.getIdToken();

      await PerkifyApi.post(
        "user/auth/deletePerkGroup",
        JSON.stringify({
          group: id,
        }),
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    })();
  };

  const [groupEmails, setEmails] = useState([]);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (Object.keys(admin).length != 0) {
      // get list of emails that belong to the perk group
      db.collection("users")
        .where("businessID", "==", admin.companyID)
        .where("group", "==", id)
        .get()
        .then((querySnapshot) => {
          setEmails(
            querySnapshot.docs.map((doc, index) => ({
              email: doc.id,
              id: index,
            }))
          );
        })
        .catch((error) => {
          console.log("Error getting documents: ", error);
        });
    }
  }, [admin, id]);

  useEffect(() => {
    if (Object.keys(business).length != 0) {
      setPerksData(
        business.groups[id].map((perk, index) => ({
          id: index,
          ...allPerksDict[perk],
        }))
      );
    }
  }, [business, id]);

  return (
    <>
      <Header
        title="Manage Perk Groups"
        crumbs={["Dashboard", "Perk Groups", "Cole's Group"]}
        button={{
          type: "delete",
          onClick: deletePerkGroup,
        }}
      />

      <Grid container spacing={5}>
        <Grid item sm={6} xs={12}>
          <AddRemoveTable
            rows={groupPerks}
            height={600}
            columns={perkColumns}
            setSelected={setSelectedPerks}
            onClickAdd={() => {
              setIsAddPerksModalVisible(true);
            }}
            onClickDelete={() => {
              setIsRemovePerksModalVisible(true);
            }}
            tableName="Group Perks"
            addButtonText="Add Group Perk"
          />
        </Grid>
        <Grid item sm={6} xs={12}>
          <AddRemoveTable
            height={600}
            rows={groupEmails}
            columns={columns}
            setSelected={setSelectedEmployees}
            onClickAdd={() => {
              setIsAddEmployeesModalVisible(true);
            }}
            onClickDelete={() => {
              setIsRemoveEmployeesModalVisible(true);
            }}
            tableName="Group Employees"
            addButtonText="Add Employees"
          />
        </Grid>
      </Grid>

      <AddEmployees
        isAddEmployeesModalVisible={isAddEmployeesModalVisible}
        setIsAddEmployeesModalVisible={setIsAddEmployeesModalVisible}
        group={id}
        employees={groupEmails}
        selectedPerks={groupPerks}
      />
      <RemoveEmployees
        isRemoveEmployeesModalVisible={isRemoveEmployeesModalVisible}
        setIsRemoveEmployeesModalVisible={setIsRemoveEmployeesModalVisible}
        selectedEmployees={selectedEmployees}
        setSelectedEmployees={setSelectedEmployees}
      />

      <AddPerks
        isAddPerksModalVisible={isAddPerksModalVisible}
        setIsAddPerksModalVisible={setIsAddPerksModalVisible}
        selectedPerks={groupPerks}
        group={id}
        emails={groupEmails}
      />
      <RemovePerks
        isRemovePerksModalVisible={isRemovePerksModalVisible}
        setIsRemovePerksModalVisible={setIsRemovePerksModalVisible}
        selectedPerks={selectedPerks}
        setSelectedPerks={setSelectedPerks}
      />
    </>
  );
}
