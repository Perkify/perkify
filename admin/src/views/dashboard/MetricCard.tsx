import { Box, Card, Typography } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import React from 'react';

const MetricCard = ({ title, number }) => {
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
          <Grid
            item
            xs={12}
            justifyContent="center"
            alignItems="center"
            style={{ display: 'flex' }}
          >
            <div>
              <b
                style={{ fontSize: 16, marginBottom: '20px', display: 'block' }}
              >
                {title}
              </b>
              <Typography variant="h4">
                <Box
                  fontWeight={800}
                  style={{ display: 'flex', justifyContent: 'center' }}
                >
                  {number}
                </Box>
              </Typography>
            </div>
          </Grid>
        </Grid>
      </Card>
    </div>
  );
};

export default MetricCard;
