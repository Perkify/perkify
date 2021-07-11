import React, { useCallback, useContext } from "react";
import { withRouter, Redirect } from "react-router";
import app from "./firebaseapp.js";
import { AuthContext } from "./Auth.js";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";

import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";

import { Form, Input, Button, Checkbox } from "antd";
import "antd/dist/antd.css";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
}));

const Login = ({ history }) => {
  const classes = useStyles();
  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 40,
    },
  };

  const handleLogin = useCallback(
    async (event) => {
      const email = event.email;
      const password = event.password;
      try {
        await app.auth().signInWithEmailAndPassword(email, password);
        history.push("/");
      } catch (error) {
        alert(error);
      }
    },
    [history]
  );

  const { currentUser } = useContext(AuthContext);

  if (currentUser) {
    return <Redirect to="/" />;
  }
  return (
    <Container maxWidth={"xs"}>
      <Paper className={classes.paper} style={{ height: "100%" }}>
        <br></br>
        <h2
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "left",
          }}
        >
          Sign in to your account{" "}
        </h2>

        <Form
          {...layout}
          name="basic"
          initialValues={{
            remember: true,
          }}
          onFinish={handleLogin}
        >
          <Grid container spacing={0}>
            <Grid item xs={1}>
              {" "}
            </Grid>
            <Grid item xs={10}>
              <h4 style={{ textAlign: "left" }}>Email</h4>
              <Form.Item
                label=""
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Please input your username!",
                  },
                ]}
              >
                <Input style={{ width: "100%", borderRadius: "5px" }} />
              </Form.Item>
            </Grid>
            <Grid item xs>
              {" "}
            </Grid>
          </Grid>
          <Grid container spacing={0}>
            <Grid item xs={1}>
              {" "}
            </Grid>
            <Grid item xs={10}>
              <Grid container spacing={0}>
                <Grid item xs={4}>
                  <h4 style={{ textAlign: "left" }}>Password</h4>
                </Grid>
                <Grid item xs={8} style={{ textAlign: "right" }}>
                  <a>Forgot your password? </a>
                </Grid>
              </Grid>
              <Form.Item
                label=""
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please input your password!",
                  },
                ]}
              >
                <Input.Password
                  style={{ width: "100%", borderRadius: "5px" }}
                />
              </Form.Item>
            </Grid>
          </Grid>
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
                  Log in
                </Button>
              </Form.Item>
            </Grid>
          </Grid>
        </Form>
        <Link
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          to="./signup"
        >
          Don't have an account? Sign up
        </Link>
      </Paper>
    </Container>
  );
};

export default withRouter(Login);
