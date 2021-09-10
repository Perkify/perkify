import { Tooltip } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { makeStyles } from '@material-ui/styles';
import React from 'react';

const useStyles = makeStyles({
  table: {
    minWidth: 550,
    '& .MuiTableCell-root': {
      padding: '16px 0',
    },
  },
});

export default function PriceBreakdownTable({
  rows,
  subscriptionPrices,
}: {
  rows: CostBreakdownRow[];
  subscriptionPrices: SubscriptionPrices;
}) {
  const classes = useStyles();

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      style={{ border: 'none' }}
    >
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Perk Name</TableCell>
            <TableCell align="right">Quantity</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.perkName}>
              <TableCell component="th" scope="row">
                {row.perkName}
              </TableCell>
              <TableCell align="right">{row.quantity}</TableCell>
              <TableCell align="right">{`$${row.price.toFixed(2)}`}</TableCell>
              <TableCell align="right">{`$${row.amount.toFixed(2)}`}</TableCell>
            </TableRow>
          ))}

          <TableRow key="subtotal">
            <TableCell
              style={{ border: 'none' }}
              component="th"
              scope="row"
            ></TableCell>
            <TableCell style={{ border: 'none' }} align="right"></TableCell>
            <TableCell
              style={{ border: 'none', fontWeight: 'bold' }}
              align="right"
            >
              Subtotal
            </TableCell>
            <TableCell
              style={{ border: 'none' }}
              align="right"
            >{`$${subscriptionPrices.subtotal.toFixed(2)}`}</TableCell>
          </TableRow>

          <TableRow key="perkifyVolume">
            <TableCell
              style={{ border: 'none' }}
              component="th"
              scope="row"
            ></TableCell>
            <TableCell style={{ border: 'none' }} align="right"></TableCell>
            <TableCell
              style={{ border: 'none', display: 'flex', alignItems: 'center' }}
              align="right"
            >
              <p style={{ order: 1, padding: 0, margin: 0 }}>Volume Fee</p>
              <div
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
                    fontSize="small"
                    style={{ order: 2, color: 'grey' }}
                  />
                </Tooltip>
              </div>
            </TableCell>
            <TableCell
              style={{ border: 'none' }}
              align="right"
            >{`$${subscriptionPrices.volumeFee.toFixed(2)}`}</TableCell>
          </TableRow>

          <TableRow key="perkifyCardMaintenance">
            <TableCell
              style={{ border: 'none' }}
              component="th"
              scope="row"
            ></TableCell>
            <TableCell style={{ border: 'none' }} align="right"></TableCell>
            <TableCell
              style={{ border: 'none', display: 'flex', alignItems: 'center' }}
              align="right"
            >
              <p style={{ order: 1, padding: 0, margin: 0 }}>
                Card Maintenance Fee
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '5px',
                }}
              >
                <Tooltip
                  title="The perkify card maintenance fee is $3.99 per employee."
                  placement="bottom-start"
                >
                  <InfoOutlinedIcon
                    fontSize="small"
                    style={{ order: 2, color: 'grey' }}
                  />
                </Tooltip>
              </div>
            </TableCell>
            <TableCell
              style={{ border: 'none' }}
              align="right"
            >{`$${subscriptionPrices.cardMaintenanceFee.toFixed(
              2
            )}`}</TableCell>
          </TableRow>

          <TableRow key="total">
            <TableCell
              style={{ border: 'none' }}
              component="th"
              scope="row"
            ></TableCell>
            <TableCell style={{ border: 'none' }} align="right"></TableCell>
            <TableCell
              style={{ border: 'none', fontWeight: 'bold' }}
              align="right"
            >
              Total
            </TableCell>
            <TableCell
              style={{ border: 'none' }}
              align="right"
            >{`$${subscriptionPrices.total.toFixed(2)}`}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
