import { Button, Grid, Theme, Typography } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { createStyles, makeStyles } from '@material-ui/styles';
import React from 'react';
const useDisplayBillingHistoryStyles = makeStyles((theme: Theme) =>
  createStyles({
    listContainer: {
      '& > *': {
        '&:not(:first-child)': {
          marginTop: '20px',
        },
      },
    },
  })
);

export const DisplayBillingHistory = () => {
  const classes = useDisplayBillingHistoryStyles();

  return (
    <div className={classes.listContainer}>
      <Grid container>
        <Grid item xs={3}>
          <Typography
            style={{
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Aug 25, 2021
            <OpenInNewIcon fontSize="small" style={{ marginLeft: '5px' }} />
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography>$23.72</Typography>
        </Grid>
      </Grid>

      <Grid container>
        <Grid item xs={3}>
          <Typography
            style={{
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Aug 24, 2021
            <OpenInNewIcon fontSize="small" style={{ marginLeft: '5px' }} />
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography>$43.22</Typography>
        </Grid>
      </Grid>

      <Grid container>
        <Grid item xs={3}>
          <Button
            variant="text"
            disableRipple
            style={{
              padding: 0,
              margin: 0,
              textTransform: 'none',
              backgroundColor: 'transparent',
            }}
          >
            <Typography
              style={{
                color: 'grey',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ExpandMoreIcon fontSize="small" style={{ marginRight: '5px' }} />
              View More
            </Typography>
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};
