import { Box, Typography } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import { green, orange } from '@material-ui/core/colors';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import withStyles from '@material-ui/core/styles/withStyles';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import React, { useEffect, useState } from 'react';
import { db } from 'services';
import { allPerksDict } from '../../shared';

const useStyles = makeStyles((theme) => ({
  root: { minHeight: '100vh' },
  details: {
    color: '#ABABAB',
  },
  perkContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
}));

const PerkCard = withStyles((theme) => ({
  root: {
    margin: theme.spacing(4),
    width: '200px',
    height: '200px',
    boxShadow: '0px 9px 45px 1px rgba(0,0,0,0.1)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transform: 'scale(1) !important',
    transition: `${theme.transitions.create(['box-shadow', 'transform'], {
      duration: theme.transitions.duration.complex,
    })} !important`,
    '&:hover': {
      boxShadow: '0px 12px 60px 1px rgba(0,0,0,0.2)',
      transform: 'scale(1.05) !important',
    },
  },
}))(Paper);

interface ViewPerksProps {
  employee: Employee;
  business: Business;
}

const ViewPerks = ({ employee, business }: ViewPerksProps) => {
  const classes = useStyles();
  const [lastBillingDate, setLastBillingDate] = useState<Number>();

  useEffect(() => {
    if (business) {
      (async () => {
        const subscriptionsSnapshot = await db
          .collection('businesses')
          .doc(business.businessID)
          .collection('subscriptions')
          .get();

        const staticSubscriptionItem = subscriptionsSnapshot.docs.filter(
          (doc) =>
            (doc.data() as Subscription).canceled_at == null &&
            (doc.data() as Subscription).status == 'active'
        )?.[0];

        setLastBillingDate(
          staticSubscriptionItem.data().current_period_start.seconds
        );
      })();
    }
  }, [business]);

  const perksList = () => {
    let increasingDelay = 0;
    const billingCycle = 28 * 24 * 60 * 60; // 28 days in seconds

    console.log(business);
    if (business && business.perkGroups) {
      return business.perkGroups[employee.perkGroupID].perkNames.map(
        (perkName) => {
          increasingDelay += 300;
          const perkUses = employee.perkUsesDict[perkName];
          // TODO: this is preferred:
          // (require(`images/perkLogos/${allPerksDict[perk].Img}`));
          return (
            <Grow in={true} timeout={increasingDelay}>
              {/* ADD this in to open up the instructions for the perk
            <Link
              style={{ textDecoration: 'none' }}
              to={`/dashboard/perks/${perk}`}
            >
            */}
              <a
                style={{ textDecoration: 'none' }}
                href={allPerksDict[perkName].BillingInstructionsURL}
                target="_blank"
                rel="noreferrer"
              >
                <PerkCard>
                  {lastBillingDate &&
                    (perkUses.length === 0 ||
                    perkUses[perkUses.length - 1].seconds < lastBillingDate ? (
                      <InfoOutlinedIcon
                        style={{
                          fontSize: 32,
                          color: orange[400],
                          position: 'absolute',
                          right: '0',
                          top: '0',
                          margin: '18px',
                        }}
                      />
                    ) : (
                      <CheckCircleOutlineIcon
                        style={{
                          fontSize: 32,
                          color: green[400],
                          position: 'absolute',
                          right: '0',
                          top: '0',
                          margin: '18px',
                        }}
                      />
                    ))}
                  <Avatar
                    src={`${process.env.PUBLIC_URL}/perkLogos/${allPerksDict[perkName].Img}`}
                    alt={perkName}
                    style={{ height: '70px', width: '70px' }}
                  />
                  <Typography variant="body1">
                    <Box fontWeight={600} mt={2}>
                      {perkName}
                    </Box>
                  </Typography>
                </PerkCard>
              </a>
              {/*
            </Link>
            */}
            </Grow>
          );
        }
      );
    } else {
      return <CircularProgress />;
    }
  };

  return (
    <div style={{ padding: '10% 5% 5% 5%' }}>
      <Typography gutterBottom variant="h3" component="h1">
        <Box fontWeight="bold">Hi {employee?.firstName},</Box>
      </Typography>
      <Typography gutterBottom variant="h5" component="h1">
        <Box fontWeight={700}>To redeem your perks:</Box>
      </Typography>
      <Typography gutterBottom variant="body1" component="h1">
        <ol>
          <li>
            Sign into your existing account for the perk you would like to
            access, or create a new account if you don't have one
          </li>
          <li>
            Add the credit card shown to the right as your billing information.
            Don't forget to change your billing address as well!
          </li>
          <li>Thats it!</li>
        </ol>
      </Typography>
      <Typography gutterBottom variant="h5" component="h1">
        <Box fontWeight={700}>Your perks from {business?.name}</Box>
      </Typography>
      <div className={classes.perkContainer}>{perksList()}</div>
    </div>
  );
};

export default ViewPerks;
