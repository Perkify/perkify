import React, { useState, useEffect, useContext } from "react";
import ClippedDrawer from "./VerticalNav";
import {
  DataGrid,
  GridToolbarContainer,
  useGridSlotComponentProps,
} from "@material-ui/data-grid";
import Grid from "@material-ui/core/Grid";
// import { Form, Input, Button, Checkbox } from "antd";
import Button from "@material-ui/core/Button";
import { Modal, Tabs } from "antd";
import Login from "./Login";
import RemoveUsers from "./RemoveUsers";
import AddUsers from "./AddUsers";

import firebase from "firebase/app";
import "firebase/firestore";
import { AuthContext } from "./Auth.js";

import allPerks from "./constants";
import "antd/dist/antd.css";
import { LocalConvenienceStoreOutlined } from "@material-ui/icons";
import { Theme, Typography } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/styles";

import clsx from "clsx";
import { lighten } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Toolbar from "@material-ui/core/Toolbar";
import Paper from "@material-ui/core/Paper";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import DeleteIcon from "@material-ui/icons/Delete";
import FilterListIcon from "@material-ui/icons/FilterList";
import { AddRemoveTable } from "./Components/AddRemoveTable";

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

  const showRemoveModal = () => {
    console.log(selectedUsers);
    if (selectedUsers.length === 0) {
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

  function getRemovedUserEmails() {
    var removedUsers: any[] = [];
    selectedUsers.forEach((index) => {
      removedUsers.push(peopleData[index].email);
    });
    return removedUsers;
  }

  const [peopleData, setPeopleData] = useState<any[]>([]);

  // function getRows() {
  //   //TO IMPLEMENT
  //   setPeopleData(rows);
  // }
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    // getRows();
    console.log("ran");
    var db = firebase.firestore();
    db.collection("admins")
      .doc(currentUser.uid)
      .get()
      .then((doc) => {
        if (doc.exists) {
          console.log("Document data:", doc.data());
          let businessId = doc.data()["companyID"];

          db.collection("users")
            .where("businessID", "==", businessId)
            .get()
            .then((querySnapshot) => {
              var emails: any[] = [];
              var index = 0;
              querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                console.log(doc.id, " => ", doc.data());
                emails.push({
                  email: doc.id,
                  id: index,
                  group: doc.data()["group"],
                });
                index += 1;
              });
              console.log(emails);
              setPeopleData(emails);
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
  }, []);

  return (
    <>
      <ClippedDrawer>
        <div style={{ height: 500 }}>
          <AddRemoveTable
            rows={peopleData}
            columns={columns}
            setSelected={setSelection}
            onClickAdd={showAddModal}
            onClickDelete={showRemoveModal}
          />
        </div>
      </ClippedDrawer>
      <Modal
        visible={isRemoveModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        <>
          <RemoveUsers users={getRemovedUserEmails()}></RemoveUsers>
        </>
      </Modal>
      <Modal
        visible={isAddModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        <>
          <AddUsers></AddUsers>
        </>
      </Modal>
    </>
  );
}
