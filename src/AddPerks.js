import React, { useCallback, useContext } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams,
} from "react-router-dom";
import { useState, useEffect } from "react";

import { withRouter, Redirect } from "react-router";
import app from "./firebaseapp.js";
import { AuthContext } from "./contexts/Auth.js";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import { Select } from "antd";
import firebase from "firebase/app";
import "firebase/firestore";
import allPerks from "./constants";
import allPerksDict from "./allPerksDict";

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

function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const AddPerks = ({ history, existingPerks }) => {
  let { id } = useParams();
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

  const [selectedPerks, setPerksData] = useState([]);

  function getPerksData() {
    //TO IMPLEMENT randomPerks => actual perks of the selected group
    setPerksData(randomPerks);
    console.log(selectedPerks);
  }

  useEffect(() => {
    getPerksData();
  });

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

  const handleAddPerks = useCallback(
    //TO IMPLEMENT api call to save user information
    async (event) => {
      console.log(event);
    },
    [history]
  );

  const { currentUser } = useContext(AuthContext);

  return (
    <div>
      <br></br>

      <Grid container spacing={3}>
        <Grid item xs></Grid>
        <Grid item xs={8} sm={8} style={{ height: "300px" }}>
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
            Add Perks
          </h1>

          <Form
            {...layout}
            name="basic"
            initialValues={{
              remember: true,
            }}
            onFinish={handleAddPerks}
          >
            <div>
              <Grid container spacing={0}>
                <Grid item xs={1}>
                  {" "}
                </Grid>
                <Grid item xs={10}>
                  <Grid container spacing={0}>
                    <Grid item xs={8}>
                      <h4 style={{ textAlign: "left" }}>Add Perks</h4>
                    </Grid>
                    <Grid item xs={2} style={{ textAlign: "right" }}></Grid>
                  </Grid>
                  <Form.Item
                    label=""
                    name="addedPerks"
                    rules={[
                      {
                        required: true,
                        message: "Please select a perk to add",
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      style={{ width: "100%", borderRadius: "5px" }}
                    >
                      {allPerks.map((perk) => {
                        if (existingPerks.includes(perk.Name) === false) {
                          return <Option value={perk.Name}>{perk.Name}</Option>;
                        }
                      })}
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
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ width: "100%", borderRadius: "5px" }}
                  >
                    Add Perks
                  </Button>
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

export default AddPerks;
