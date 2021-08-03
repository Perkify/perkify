import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { useHistory } from 'react-router-dom';

export const WelcomeCards = () => {
  const history = useHistory();
  return (
    <div>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Card style={{ backgroundColor: '#C8FACD' }}>
            <CardContent style={{ display: 'flex', padding: '50px' }}>
              <div
                style={{
                  width: '50%',
                  margin: '30px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-around',
                }}
              >
                <Typography gutterBottom variant="h4" component="h2">
                  <Box fontWeight="bold">Welcome to Perkify!</Box>
                </Typography>
                <Typography gutterBottom variant="h5" component="h3">
                  Connect a payment method to start creating live benefits for
                  your employees.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  style={{
                    marginTop: '30px',
                    width: '250px',
                    fontWeight: 'bold',
                    backgroundColor: '#00AB55',
                  }}
                  onClick={() => {
                    history.push('/dashboard/billing');
                  }}
                >
                  Set up billing
                </Button>
              </div>
              <img
                src="/welcome_graphic.svg"
                alt="Welcome Graphic"
                style={{ width: '400px', marginLeft: 'auto' }}
              />
            </CardContent>
          </Card>
        </Grid>
        {/* <Grid item xs={12}>
          <Card style={{ backgroundColor: '#C8FACD' }}>
            <CardContent style={{ display: 'flex', padding: '50px' }}>
              <div style={{ width: '50%', margin: '30px 0' }}>
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
                    marginTop: '30px',
                    fontWeight: 'bold',
                    backgroundColor: '#00AB55',
                  }}
                >
                  Create New Perk Group
                </Button>
              </div>
              <img
                src="/welcome_graphic.svg"
                alt="Welcome Graphic"
                style={{ width: '400px', marginLeft: 'auto' }}
              />
            </CardContent>
          </Card>
        </Grid> */}
      </Grid>
    </div>
  );
};
