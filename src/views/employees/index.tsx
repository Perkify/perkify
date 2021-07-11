import React, { useState, useEffect, useContext } from "react";
import VerticalNav from "components/VerticalNav";
import Button from "@material-ui/core/Button";
import firebase from "firebase/app";
import "firebase/firestore";
import { AuthContext } from "contexts/Auth";

import { allPerks } from "../../constants";
import { Card, MenuItem, Select, Theme, Typography } from "@material-ui/core";

import { AddRemoveTable } from "components/AddRemoveTable";

import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { validateEmails } from "utils/emailValidation";

const columns = [
  {
    field: "email",
    headerName: "Email",
    width: 300,
    editable: false,
  },
  {
    field: "group",
    headerName: "Group",
    width: 200,
    editable: false,
  },
];

export default function ManagePeople() {
  const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedUsers, setSelection] = useState([]);
  const [groupData, setGroupData] = useState(["Cole's Group"]);
  const [selectedGroup, setSelectedGroup] = useState([]);
  const [emails, setEmails] = useState("");

  const handleOk = () => {
    setIsRemoveModalVisible(false);
    setIsAddModalVisible(false);
  };

  const handleCancel = () => {
    setIsRemoveModalVisible(false);
    setIsAddModalVisible(false);
  };

  function getRemovedUserEmails() {
    var removedUsers: any[] = [];
    selectedUsers.forEach((index) => {
      removedUsers.push(peopleData[index].email);
    });
    return removedUsers;
  }

  const [peopleData, setPeopleData] = useState<any[]>([]);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const db = firebase.firestore();
    db.collection("admins")
      .doc(currentUser.uid)
      .get()
      .then((doc) => {
        const userData = doc.data();
        if (userData) {
          const businessId = userData["companyID"];
          console.log("Business ID");
          console.log(businessId);

          db.collection("users")
            .where("businessID", "==", businessId)
            .get()
            .then((querySnapshot) => {
              const emails = querySnapshot.docs.map((doc, index) => ({
                email: doc.id,
                id: index,
                group: doc.data()["group"],
              }));
              console.log("EMAILS");
              console.log(emails);
              setPeopleData(emails);
            })
            .catch((error) => {
              alert(error);
            });
        } else {
          console.log("No such document!");
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  }, []);

  return (
    <>
      <VerticalNav>
        <Card style={{ height: 500, border: 0 }} variant="outlined">
          <AddRemoveTable
            rows={peopleData}
            columns={columns}
            setSelected={setSelection}
            onClickAdd={() => setIsAddModalVisible(true)}
            onClickDelete={() => {
              console.log("Clicked");
              setIsRemoveModalVisible(true);
            }}
            tableName="Manage Employees"
            addButtonText="Add Employees"
          />
        </Card>
      </VerticalNav>
      <Dialog
        open={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Add Users</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To add users to this organization, please enter their email
            addresses below and select a group from the dropdown.
          </DialogContentText>
          <Typography style={{ marginTop: "30px", marginBottom: "15px" }}>
            Emails
          </Typography>
          <TextField
            id="emailaddresses"
            variant="outlined"
            label="Insert emails separated by commas or newlines"
            value={emails}
            onChange={(event) => setEmails(event.target.value)}
            fullWidth
            multiline
            rows={4}
            rowsMax={4}
          />
          <Typography style={{ marginTop: "30px", marginBottom: "15px" }}>
            Perk Group
          </Typography>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            variant="outlined"
            value={selectedGroup}
            displayEmpty
            multiple
            fullWidth
            onChange={(event) => {
              setSelectedGroup(event.target.value as string[]);
            }}
          >
            <MenuItem value="" disabled>
              Select Perk Group
            </MenuItem>
            {groupData.map((name) => (
              <MenuItem value={name} key={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddModalVisible(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => setIsAddModalVisible(false)} color="primary">
            Add Users
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isRemoveModalVisible}
        onClose={() => setIsRemoveModalVisible(false)}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Delete Users</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete 5 users? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsRemoveModalVisible(false)}
            color="primary"
          >
            No
          </Button>
          <Button
            onClick={() => setIsRemoveModalVisible(false)}
            color="primary"
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
