import { Box, Card, Typography } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import React from "react";

const MetricCard = ({ title, number, icon }) => {
  return (
    <div>
      <Card style={{ padding: 30 }} elevation={4}>
        <Grid
          container
          spacing={0}
          direction="row"
          alignItems="center"
          justifyContent="center"
        >
          <Grid item xs={6}>
            <b style={{ fontSize: 14, marginBottom: "20px", display: "block" }}>
              {title}
            </b>
            <Typography variant="h4">
              <Box fontWeight={800}>{number}</Box>
            </Typography>
          </Grid>
          <Grid item xs={6}>
            {icon}
          </Grid>
        </Grid>
      </Card>
    </div>
  );
};

export default MetricCard;
