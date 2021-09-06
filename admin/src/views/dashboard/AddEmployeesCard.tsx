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

export const AddEmployeesCard = () => {
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
                  <Box fontWeight="bold">Add Employees</Box>
                </Typography>
                <Typography gutterBottom variant="h5" component="h3">
                  To get started, enter in your employees information!
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    history.push('/dashboard/people');
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
