import { Grid, Theme, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import Header from 'components/Header';
import { AuthContext, BusinessContext } from 'contexts';
import React, { useContext } from 'react';
import { SectionHeading } from 'views/billing/sectionHeading';

const useBusinessSettingsStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      maxWidth: '800px',
    },
    title: {
      flex: '1 1 auto',
      marginLeft: '10px',
    },
  })
);

const InfoRow = (props: { keyName: string; value: string }) => {
  console.log(props);
  return (
    <Grid container>
      <Grid item xs={3}>
        {props.keyName}
      </Grid>
      <Grid item xs={6}>
        <Typography>{props.value}</Typography>
      </Grid>
    </Grid>
  );
};

const BusinessSettings = () => {
  const classes = useBusinessSettingsStyles();
  const { admin } = useContext(AuthContext);
  const { business } = useContext(BusinessContext);
  return (
    <div className={classes.root}>
      <Header
        title="Business Settings"
        crumbs={['Dashboard', 'Account', 'Business Settings']}
      />

      <SectionHeading title="ACCOUNT ADMINISTRATOR">
        <Grid container>
          <Grid item xs={3}>
            Name:
          </Grid>
          <Grid item xs={6}>
            <Typography>{admin.firstName + ' ' + admin.lastName}</Typography>
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={3}>
            Email:
          </Grid>
          <Grid item xs={6}>
            <Typography>{admin.email}</Typography>
          </Grid>
        </Grid>
      </SectionHeading>

      <SectionHeading title="BUSINESS INFORMATION">
        <InfoRow keyName="Name:" value={business.name} />

        <InfoRow
          keyName="Address:"
          value={`${business.billingAddress.line1}, ${business.billingAddress.postal_code}, ${business.billingAddress.city}, ${business.billingAddress.state}, ${business.billingAddress.country}
        `}
        />
      </SectionHeading>
    </div>
  );
};

export default BusinessSettings;
