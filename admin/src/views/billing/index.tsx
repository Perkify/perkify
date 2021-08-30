import { Theme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import Header from 'components/Header';
import React from 'react';
import { DisplayBillingHistory } from './billingHistorySection';
import { DisplayCurrentPlan } from './currentPlanSection';
import { PaymentMethodsSection } from './paymentMethodSection';
import { SectionHeading } from './sectionHeading';

const useBillingPageStyles = makeStyles((theme: Theme) =>
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

const Billing = () => {
  const classes = useBillingPageStyles();

  return (
    <div className={classes.root}>
      <Header title="Billing" crumbs={['Dashboard', 'Account', 'Billing']} />

      <PaymentMethodsSection />

      <SectionHeading title="CURRENT PERKIFY PLAN">
        <DisplayCurrentPlan />
      </SectionHeading>

      <SectionHeading title="BILLING HISTORY">
        <DisplayBillingHistory />
      </SectionHeading>
    </div>
  );
};

export default Billing;
