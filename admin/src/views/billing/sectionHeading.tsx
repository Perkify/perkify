import { Divider, Typography } from '@material-ui/core';
import React from 'react';

export const SectionHeading = ({
  title,
  children,
}: // color,
{
  title: string;
  children: React.ReactNode;
  // color?: string;
}) => {
  return (
    <div style={{ marginBottom: '80px' }}>
      <Typography
        gutterBottom
        variant="button"
        style={{
          display: 'inline-block',
          fontWeight: 'bold',
          // color: color ? color : 'black',
        }}
      >
        {title}
      </Typography>
      <Divider style={{ marginBottom: '20px' }} />
      {children}
    </div>
  );
};
