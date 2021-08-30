import { Divider, Typography } from '@material-ui/core';
import React from 'react';

export const SectionHeading = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div style={{ marginBottom: '80px' }}>
      <Typography
        gutterBottom
        variant="button"
        style={{ display: 'inline-block', fontWeight: 'bold' }}
      >
        {title}
      </Typography>
      <Divider style={{ marginBottom: '20px' }} />
      {children}
    </div>
  );
};
