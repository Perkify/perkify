import { Grid } from "@material-ui/core";
import { AddRemoveTable } from "components/AddRemoveTable";
import Header from "components/Header";
import { AuthContext } from "contexts/Auth";
import firebase from "firebase/app";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

  const [peopleData, setPeopleData] = useState([]);

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

  function getGroupData() {
    //TO IMPLEMENT
    groupData = fillerGroupData;
  }

  const [useEffectComplete, setUseEffectComplete] = useState(false);
  const [groupEmails, setEmails] = useState([]);
  const { currentUser } = useContext(AuthContext);

  getGroupData();

  useEffect(() => {
    console.log("ran");
    var db = firebase.firestore();
    db.collection("admins")
      .doc(currentUser.uid)
      .get()
      .then((doc) => {
        const adminDoc = doc.data();
        if (adminDoc) {
          //   console.log("Document data:", doc.data());
          let businessId = adminDoc["companyID"];
          db.collection("businesses")
            .doc(businessId)
            .get()
            .then((doc) => {
              const businessDoc = doc.data();
              if (businessDoc) {
                console.log(businessDoc.groups);

                setViewWithPerksData(businessDoc.groups[id]);
                setUseEffectComplete(true);
              }
            });

          db.collection("users")
            .where("businessID", "==", businessId)
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
          // doc.data() will be undefined in this case
          console.log("No such document!");
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  }, [id]);

  function getRemovedPerks() {
    const removedPerks = selectedPerks.map((index) => {
      console.log(index);
      removedPerks.push(groupPerks[index]);
    });
    console.log(removedPerks);
    return removedPerks;
  }

  function setViewWithPerksData(perkData) {
    //TO IMPLEMENT randomPerks => actual perks of the selected group
    console.log(perkData);
    const ret = perkData.map((perk) => allPerksDict[perk]);
    var index = 0;
    ret.forEach((perk) => {
      perk["id"] = index;
      index += 1;
    });
    console.log(ret);
    setPerksData(ret);
  }

  return (
    <>
      <Header
        title="Manage Perk Groups"
        crumbs={["Dashboard", "Perk Groups", "Cole's Group"]}
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
