import React, { useCallback, useContext } from "react";
import { useState, useEffect } from "react";

import { withRouter, Redirect } from "react-router";
import app from "firebaseApp";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import { Select } from "antd";
import firebase from "firebase/app";
import "firebase/firestore";
import { AuthContext } from "@contexts/Auth";

import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { Form, Input, Button, Checkbox } from "antd";
import "antd/dist/antd.css";
import { AutoComplete } from "antd";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

const groups = ["A", "B", "C"];

const randomPerks = ["Netflix", "Instacart", "Amazon Prime"];

const allPerks = ["Netflix", "Instacart", "Amazon Prime", "Spotify"];

function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const AddUsers = () => {
  function validateEmails(emailString) {
    let emails = emailString.replace(/[,'"]+/gi, " ").split(/\s+/);
    let retValue = true;
    emails.forEach((email) => {
      if (validateEmail(email) === false) {
        retValue = false;
      }
    });
    console.log("WTF");
    return retValue;
  }

  const { TextArea } = Input;
  const allPerksView = [];

  var [groupData, setGroupData] = useState([]);
  const [selectedPerks, setPerksData] = useState([]);

  function getGroupData() {
    //TO IMPLEMENT with group data set groupData = all perks a group should hold onto
    setGroupData(groups);
  }

  function getPerksData() {
    //TO IMPLEMENT randomPerks => actual perks of the selected group
    setPerksData(randomPerks);
    console.log(selectedPerks);
  }

  const [useEffectComplete, setUseEffectComplete] = useState(false);

  //   useEffect(() => {
  //     console.log(groupData[0]);
  //     var db = firebase.firestore();
  //     db.collection("admins")
  //       .doc(currentUser.uid)
  //       .get()
  //       .then((doc) => {
  //         if (doc.exists) {
  //           console.log("Document data:", doc.data());
  //           var adminData = doc.data();
  //           let businessId = doc.data()["companyID"];
  //           db.collection("businesses")
  //             .doc(businessId)
  //             .get()
  //             .then((doc) => {
  //               setGroupData(Object.keys(doc.data()["groups"]));
  //               console.log(doc.data()["groups"]);
  //               setUseEffectComplete(true);
  //             });
  //           // doc.data() will be undefined in this case
  //           console.log("No such document!");
  //         }
  //       })
  //       .catch((error) => {
  //         console.log("Error getting document:", error);
  //       });
  //   }, []);

  function handleChange(value) {
    setPerksData(value);
  }

  const classes = useStyles();
  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 40,
    },
  };
  const tailLayout = {
    wrapperCol: {
      offset: 8,
      span: 50,
    },
  };

  const { Option } = Select;

  const handleAddUsers = useCallback(
    //TO IMPLEMENT api call to save user information
    async (event) => {
      console.log(event);
      let emails = event.emails;
      emails = emails.replace(/[,'"]+/gi, " ").split(/\s+/); //Gives email as a list
      let group = event.group;
      let perks = event.addedPerks;
      console.log(emails, groups, perks);
    },
    []
  );

  const { currentUser } = useContext(AuthContext);

  return (
    <div>
      <br></br>

      <Grid container spacing={3}>
        <Grid item xs></Grid>
        <Grid item xs={8} sm={8} style={{ height: "650px" }}>
          <br></br>
          <h1
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "left",
              textAlign: "center",
            }}
          >
            {" "}
            Add Users
          </h1>

          <Form
            {...layout}
            name="basic"
            initialValues={{
              remember: true,
            }}
            onFinish={handleAddUsers}
          >
            <div>
              <Grid container spacing={0}>
                <Grid item xs={1}>
                  {" "}
                </Grid>
                <Grid item xs={10}>
                  <h4 style={{ textAlign: "left" }}>Paste Emails Below</h4>
                  <Form.Item
                    label=""
                    name="emails"
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (value === "") {
                            return Promise.reject(
                              new Error("Please input atleast one email")
                            );
                          }
                          if (validateEmails(value)) {
                            return Promise.resolve();
                          } else {
                            return Promise.reject(
                              new Error("Please input proper emails")
                            );
                          }
                        },
                      }),
                    ]}
                  >
                    <TextArea
                      placeholder="Paste emails as CSV or seperated by a line"
                      rows={5}
                      allowClear
                      style={{ width: "100%", borderRadius: "5px" }}
                    />
                  </Form.Item>
                </Grid>
                <Grid item xs>
                  {" "}
                </Grid>
              </Grid>
            </div>
            <div>
              <Grid container spacing={0}>
                <Grid item xs={1}>
                  {" "}
                </Grid>
                <Grid item xs={10}>
                  <Grid container spacing={0}>
                    <Grid item xs={8}>
                      <h4 style={{ textAlign: "left" }}>Select a Group</h4>
                    </Grid>
                    <Grid item xs={2} style={{ textAlign: "right" }}></Grid>
                  </Grid>
                  <Form.Item
                    label=""
                    name="group"
                    rules={[
                      {
                        required: true,
                        message: "Please select a group!",
                      },
                    ]}
                  >
                    <Select
                      style={{ width: "100%", borderRadius: "5px" }}
                      onSelect={getPerksData}
                    >
                      {/* {groupData.map((name) => (
                        <Option value={name}>{name}</Option>
                      ))} */}
                    </Select>
                  </Form.Item>
                </Grid>
                <Grid item xs>
                  {" "}
                </Grid>
              </Grid>
            </div>

            <Grid container spacing={0}>
              <Grid item xs={1}>
                {" "}
              </Grid>
              <Grid item xs={10}>
                <Form.Item style={{ width: "100%", borderRadius: "5px" }}>
                  {/* <Button
                    type="primary"
                    htmlType="submit"
                    style={{ width: "100%", borderRadius: "5px" }}
                  >
                    Add Users
                  </Button> */}
                </Form.Item>
              </Grid>
            </Grid>
          </Form>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
    </div>
  );
};

export default AddUsers;
