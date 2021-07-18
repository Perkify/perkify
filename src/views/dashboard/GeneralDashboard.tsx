import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@material-ui/core";
import Header from "components/Header";
import React from "react";

const GeneralDashboard = () => {
  return (
    <div>
      <Header title="Dashboard" crumbs={["Dashboard"]} />
      <Grid container>
        <Grid item xs={8}>
          <Card style={{ backgroundColor: "#C8FACD" }}>
            <CardContent style={{ display: "flex", padding: "40px" }}>
              <div style={{ width: "50%", margin: "30px 0" }}>
                <Typography gutterBottom variant="h5" component="h2">
                  <Box fontWeight="bold">Welcome back to Perkify!</Box>
                </Typography>
                <Typography gutterBottom variant="body1" component="h3">
                  We see you haven't created any perk groups yet, get started
                  now
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  style={{
                    marginTop: "30px",
                    fontWeight: "bold",
                    backgroundColor: "#00AB55",
                  }}
                >
                  Create New Perk Group
                </Button>
              </div>
              <img
                src="/welcome_graphic.svg"
                alt="Welcome Graphic"
                style={{ width: "300px", marginLeft: "auto" }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default GeneralDashboard;
