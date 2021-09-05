import { Theme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import Header from 'components/Header';
import { InfoRow } from 'components/InfoRow';
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
        <InfoRow
          keyName="Name:"
          value={admin.firstName + ' ' + admin.lastName}
        />
        <InfoRow keyName="Email:" value={admin.email} />
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
