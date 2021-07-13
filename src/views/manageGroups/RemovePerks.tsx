import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import { Form } from "antd";
import { AuthContext } from "contexts/Auth";
import "firebase/firestore";
import React, { useContext } from "react";

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

const RemovePerks = ({ history, perks }) => {
  console.log(perks);
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

  const handleRemoveUsers = () => {
    console.log(perks);
  };

  const { currentUser } = useContext(AuthContext);

  return (
    <div>
      <br></br>

      <Grid container spacing={3}>
        <Grid item xs></Grid>
        <Grid item xs={8} sm={8} style={{ height: "200px" }}>
          <br></br>
          <h2
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            {" "}
            Are you sure you want to remove these perks?{" "}
          </h2>

          <Form
            {...layout}
            name="basic"
            initialValues={{
              remember: true,
            }}
            onFinish={handleRemoveUsers}
          >
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
                    Yes
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

export default RemovePerks;
