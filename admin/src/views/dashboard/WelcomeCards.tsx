import {
  Button,
  Card,
  Grid,
  Theme,
  Typography,
  useTheme,
} from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import React from 'react';
import { useHistory } from 'react-router-dom';

interface OnboardingCardProps {
  number: string;
  title: string;
  caption: string;
  buttonText: string;
  status: number;
  onClick: any;
}

const OnboardingCard = ({
  number,
  title,
  caption,
  buttonText,
  status,
  onClick,
}: OnboardingCardProps) => {
  const theme = useTheme<Theme>();

  const getColor = () =>
    status === 2
      ? '#5DB521'
      : status === 1
      ? theme.palette.primary.main
      : 'rgba(0, 0, 0, .25)';

  const getBorder = () =>
    status === 1 ? `1px solid ${getColor()}` : `1px solid ${getColor()}`;

  return (
    <Card
      elevation={4}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '50px',
        height: '300px',
        border: getBorder(),
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          textAlign: 'center',
          fontSize: '32px',
          border: getBorder(),
          transform: 'translateY(-90px)',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: getColor(),
        }}
      >
        {status === 2 ? <CheckIcon fontSize="large" /> : number}
      </div>
      <Typography
        variant="h5"
        style={{ textAlign: 'center', fontWeight: 'bold' }}
      >
        {title}
      </Typography>

      <Typography variant="body1" style={{ textAlign: 'center' }}>
        {caption}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        style={{ visibility: status === 1 ? 'visible' : 'hidden' }}
        onClick={onClick}
      >
        {buttonText}
      </Button>
    </Card>
  );
};

interface WelcomeCardsProps {
  hasPaymentMethods: boolean;
  hasEmployees: boolean;
  hasPerkGroup: boolean;
}

export const WelcomeCards = ({
  hasPaymentMethods,
  hasEmployees,
  hasPerkGroup,
}: WelcomeCardsProps) => {
  const history = useHistory();
  return (
    <div>
      <Typography variant="h3" gutterBottom>
        Welcome to Perkify!
      </Typography>
      <Typography variant="h6" style={{ marginBottom: '100px' }}>
        Complete the following steps in order to finish setting up your Perkify
        account.
      </Typography>
      <Grid container spacing={8}>
        <Grid item xs={4}>
          <OnboardingCard
            number="1"
            title="Connect a Payment Method"
            caption="Connect a payment method to be used when creating perk groups"
            buttonText="Connect a payment method"
            status={hasPaymentMethods ? 2 : 1}
            onClick={() => history.push('/dashboard/billing')}
          />
        </Grid>

        <Grid item xs={4}>
          <OnboardingCard
            number="2"
            title="Add Your Employees"
            caption="Populate your employees directory so that you can add them to perk groups."
            buttonText="Add Your Employees"
            status={hasEmployees ? 2 : hasPaymentMethods ? 1 : 0}
            onClick={() => history.push('/dashboard/people')}
          />
        </Grid>

        <Grid item xs={4}>
          <OnboardingCard
            number="3"
            title="Create Your First Perk Group"
            caption="Create a perk group to start generating live benefits for your employees"
            buttonText="Create A Perk Group"
            status={hasPerkGroup ? 2 : hasEmployees ? 1 : 0}
            onClick={() => history.push('/dashboard/create/group')}
          />
        </Grid>
      </Grid>
    </div>
  );
};
