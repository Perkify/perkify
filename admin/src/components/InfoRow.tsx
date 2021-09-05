import { Grid, Typography } from '@material-ui/core';
import React from 'react';

export const InfoRow = (props: { keyName: string; value: string }) => (
  <Grid container>
    <Grid item xs={3}>
      {props.keyName}
    </Grid>
    <Grid item xs={6}>
      <Typography>{props.value}</Typography>
    </Grid>
  </Grid>
);
