import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Typography,
} from '@material-ui/core';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import React from 'react';
import { useHistory } from 'react-router-dom';

interface TodoItemProps {
  completed: boolean;
  text: string;
}

const TodoItem = ({ completed, text }: TodoItemProps) => {
  return (
    <>
      {/* <Grid item xs={2}>
        <Chip
          style={{ backgroundColor: 'lightgreen' }}
          label={completed ? 'DONE' : 'TODO'}
        ></Chip>
      </Grid> */}
      <Grid item xs={6}>
        <Typography gutterBottom variant="h6">
          {text}
        </Typography>

        {/* <Typography gutterBottom variant="body1">
                    Connect a payment method to start creating live benefits for
                    your employees.
                  </Typography> */}
      </Grid>
      <Grid item xs={6}>
        <Button>Complete Now</Button>
      </Grid>
    </>
  );
};

interface WelcomeCardsProps {
  hasCardPaymentMethods: boolean;
  hasEmployees: boolean;
  hasPerkGroups: boolean;
}

export const WelcomeCards = ({
  hasCardPaymentMethods,
  hasEmployees,
  hasPerkGroups,
}: WelcomeCardsProps) => {
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
                <Grid item xs={12} style={{ marginBottom: '30px' }}>
                  <Typography gutterBottom variant="h5" component="h3">
                    Complete the following steps to finish setting up your
                    perkify account.
                    {/* Connect a payment method to start creating live benefits for
                    your employees. */}
                  </Typography>
                  {/* <Button
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
                  </Button> */}
                </Grid>

                <ol>
                  <Typography
                    component="li"
                    variant="h5"
                    style={{
                      textDecoration: 'line-through',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      Add a payment method
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginLeft: '5px',
                        }}
                      >
                        <Tooltip
                          title="The perkify volume fee is 10% of the cost of perks."
                          placement="bottom-start"
                        >
                          <InfoOutlinedIcon
                            style={{ order: 2, color: 'grey' }}
                          />
                        </Tooltip>
                      </span>
                    </div>
                  </Typography>
                  <Typography component="li" variant="h5">
                    Add your employees
                  </Typography>
                  <Typography component="li" variant="h5">
                    Create your first perk group
                  </Typography>
                </ol>
                {/* <Grid container>
                  <TodoItem completed={false} text="1. Add a payment method" />

                  <Grid item xs={12}>
                    <Typography gutterBottom variant="h6">
                      2. Add Your Employees
                    </Typography>

                    <Typography gutterBottom variant="body1">
                    Add the email addresses of your employees to your perkify
                    business account.
                  </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography gutterBottom variant="h6">
                      3. Create Your First Perk Group
                    </Typography>

                    <Typography gutterBottom variant="body1">
                    Create your first perk group to start generating live
                    satisfaction.
                  </Typography>
                  </Grid>
                </Grid> */}
              </div>
              {/* <div
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
              </div> */}
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
