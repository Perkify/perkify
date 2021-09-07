import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { useHistory } from 'react-router-dom';

export const CreatePerkGroupCard = () => {
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
                  <Box fontWeight="bold">Create Your First Perk Group</Box>
                </Typography>
                <Typography gutterBottom variant="h5" component="h3">
                  We see you haven't created any perk groups yet, get started
                  now!
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    history.push('/dashboard/create/group');
                  }}
                  style={{
                    marginTop: '30px',
                    width: '250px',
                    fontWeight: 'bold',
                    backgroundColor: '#00AB55',
                  }}
                >
                  Create Perk Group
                </Button>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <FormGroup row>
                  <div
                    aria-disabled
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      width: '100%',
                      height: '100%',
                      zIndex: 9999,
                    }}
                  ></div>
                  <FormControlLabel
                    style={{ width: '100%' }}
                    control={<Checkbox name="Set Up Billing" />}
                    label="Set Up Billing"
                  ></FormControlLabel>

                  <FormControlLabel
                    style={{ width: '100%' }}
                    control={<Checkbox name="Add Employees" />}
                    label="Add Employees"
                  />
                  <FormControlLabel
                    style={{ width: '100%' }}
                    control={<Checkbox name="Create a Perk Group" />}
                    label="Create a Perk Group"
                  />
                </FormGroup>
              </div>
              <img
                src="/welcome_graphic.svg"
                alt="Welcome Graphic"
                style={{ width: '400px', marginLeft: 'auto' }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};
