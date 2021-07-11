import React, { useState, useEffect, useContext } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
} from "react-router-dom";
import ClippedDrawer from "./VerticalNav";
import { DataGrid } from "@material-ui/data-grid";
import Grid from "@material-ui/core/Grid";
import { Form, Input, Button, Checkbox } from "antd";
import { Modal, Tabs } from "antd";
import RemovePerks from "./RemovePerks";
import AddPerks from "./AddPerks";
import firebase from "firebase/app";
import "firebase/firestore";
import { AuthContext } from "./contexts/Auth";
import allPerks from "./constants";
import allPerksDict from "./allPerksDict";

const columns = [
  // {
  //   field: 'firstName',
  //   headerName: 'First name',
  //   width: 150,
  //   editable: false,
  // },
  // {
  //   field: 'lastName',
  //   headerName: 'Last name',
  //   width: 150,
  //   editable: false,
  // },
  {
    field: "email",
    headerName: "Email",
    width: 300,
    editable: false,
  },
  // {
  //     field: 'extras',
  //     headerName: 'Extras',
  //     width: 400,
  //     editable: false,
  //   },
];

const rows = [
  {
    id: 1,
    lastName: "Snow",
    firstName: "Jon",
    email: "jerry1ye10@gmail.com",
    extras: "Netflix, Perkify, Bloomberg, TV, NYT",
  },
  {
    id: 2,
    lastName: "Lannister",
    firstName: "Cersei",
    email: "jerry1ye10@gmail.com",
  },
  {
    id: 3,
    lastName: "Lannister",
    firstName: "Jaime",
    email: "jerry1ye10@gmail.com",
  },
  {
    id: 4,
    lastName: "Stark",
    firstName: "Arya",
    email: "jerry1ye10@gmail.com",
  },
  {
    id: 5,
    lastName: "Targaryen",
    firstName: "Daenerys",
    email: "jerry1ye10@gmail.com",
  },
  {
    id: 6,
    lastName: "Melisandre",
    firstName: null,
    email: "jerry1ye10@gmail.com",
  },
  {
    id: 7,
    lastName: "Clifford",
    firstName: "Ferrara",
    email: "jerry1ye10@gmail.com",
  },
  {
    id: 8,
    lastName: "Frances",
    firstName: "Rossini",
    email: "jerry1ye10@gmail.com",
  },
  {
    id: 9,
    lastName: "Roxie",
    firstName: "Harvey",
    email: "jerry1ye10@gmail.com",
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
  console.log(id);

  const [peopleData, setPeopleData] = useState([]);

  const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedPerks, setSelection] = useState([]);
  const [groupPerks, setPerksData] = useState([]);

  function getPerkNames(perks) {
    var retNames = [];
    perks.forEach((perk) => {
      retNames.push(perk.Name);
    });

    return retNames;
  }

  const randomPerks = ["Netflix", "Instacart", "Amazon Prime"];

  const showRemoveModal = () => {
    console.log(selectedPerks);
    if (selectedPerks.length === 0) {
      return;
    }
    setIsRemoveModalVisible(true);
  };

  const showAddModal = () => {
    setIsAddModalVisible(true);
  };

  const handleOk = () => {
    setIsRemoveModalVisible(false);
    setIsAddModalVisible(false);
  };

  const handleCancel = () => {
    setIsRemoveModalVisible(false);
    setIsAddModalVisible(false);
  };

  function getPeopleRowData() {
    //TO IMPLEMENT GET DATA BASED ON GROUP & SETPEOPLEDATA TO IT
    setPeopleData(rows);
  }

  var groupData = [];
  var fillerGroupData = [
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
        if (doc.exists) {
          console.log("Document data:", doc.data());
          let businessId = doc.data()["companyID"];
          db.collection("businesses")
            .doc(businessId)
            .get()
            .then((doc) => {
              console.log(doc.data().groups);

              setViewWithPerksData(doc.data().groups[id]);
              setUseEffectComplete(true);
            });

          db.collection("users")
            .where("businessID", "==", businessId)
            .where("group", "==", id)
            .get()
            .then((querySnapshot) => {
              var emails = [];
              var index = 0;
              querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                console.log(doc.id, " => ", doc.data());
                emails.push({ email: doc.id, id: index });
                index += 1;
              });
              setEmails(emails);
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
    var removedPerks = [];
    console.log(selectedPerks);
    selectedPerks.forEach((index) => {
      console.log(index);
      removedPerks.push(groupPerks[index]);
    });
    console.log(removedPerks);
    return removedPerks;
  }

  function setViewWithPerksData(perkData) {
    //TO IMPLEMENT randomPerks => actual perks of the selected group
    console.log(perkData);
    var ret = [];
    perkData.forEach((perk) => {
      ret.push(allPerksDict[perk]);
    });
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
      <ClippedDrawer groups={groupData}>
        <div style={{ width: 500 }}>
          <Grid
            container
            spacing={0}
            justifyContent="center"
            alignItems="center"
          >
            <Grid item xs={4} md={6}>
              <h2>Group Perks</h2>
            </Grid>
            <Grid item xs={3} alignItems="flex-end" justifyContent="center">
              <Button
                type="primary"
                onClick={showAddModal}
                htmlType="submit"
                style={{
                  width: "80%",
                  borderRadius: "5px",
                  alignText: "center",
                  height: "40px",
                }}
              >
                Add
              </Button>
            </Grid>

            <Grid item xs={3}>
              <Button
                type="primary"
                onClick={showRemoveModal}
                htmlType="submit"
                style={{
                  width: "80%",
                  borderRadius: "5px",
                  height: "40px",
                  alignText: "center",
                }}
              >
                Remove
              </Button>
            </Grid>
          </Grid>
        </div>
        <br></br>

        <div style={{ height: 300, width: 500 }}>
          <DataGrid
            rows={groupPerks}
            columns={perkColumns}
            pageSize={100}
            checkboxSelection
            onSelectionModelChange={(newSelection) => {
              console.log("WTFF");
              console.log(newSelection);
              setSelection(newSelection.selectionModel);
            }}
          />
        </div>

        <br></br>

        <Grid container spacing={0} justifyContent="center" alignItems="center">
          <Grid item xs={6} md={8}>
            <h2>Group Members</h2>
          </Grid>
        </Grid>
        <div style={{ height: 400, width: 500 }}>
          <DataGrid rows={groupEmails} columns={columns} pageSize={100} />
        </div>
      </ClippedDrawer>
      <Modal
        visible={isRemoveModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        <>
          <RemovePerks perks={getPerkNames(getRemovedPerks())}></RemovePerks>
        </>
      </Modal>
      <Modal
        visible={isAddModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        <>
          <AddPerks existingPerks={getPerkNames(groupPerks)}></AddPerks>
        </>
      </Modal>
    </>
  );
}
