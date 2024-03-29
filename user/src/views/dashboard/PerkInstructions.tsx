import { Box, Typography } from '@material-ui/core';
import Grow from '@material-ui/core/Grow';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

const PerkInstructions = () => {
  let { perk } = useParams<{ perk: string }>();
  const history = useHistory();
  const [show, setShow] = useState(true);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: '26px',
      }}
    >
      <Grow
        in={show}
        timeout={{
          enter: 500,
          exit: 170,
        }}
        onExited={() => {
          history.push('/dashboard/perks');
        }}
      >
        <div style={{ height: '100%', position: 'relative' }}>
          <IconButton
            style={{
              fontSize: 32,
              position: 'absolute',
              left: '0',
              top: '0',
              margin: '60px',
            }}
            onClick={() => {
              setShow(false);
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <div
            style={{
              padding: '56px 60px 30px 120px',
            }}
          >
            <Typography gutterBottom variant="h3" component="h1">
              <Box fontWeight="bold">How to Redeem {perk}</Box>
            </Typography>
          </div>
        </div>
      </Grow>
    </div>
  );
};

export default PerkInstructions;
