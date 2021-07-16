import Header from "components/Header";
import React from "react";
import Grid from "@material-ui/core/Grid";
import {
  Button,
  Card,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import PaymentIcon from '@material-ui/icons/Payment';

const MetricCard = ({title, number, children}) => {
  return (
    <div>

        <Card style={{ width: "90%", padding: 10, height: 130 }} elevation={4}> 
          <Grid container spacing={0} direction="row" alignItems="center" justifyContent="center">
            <Grid item xs={6}> <b style={{fontSize: 14, marginLeft: 3}}>{title}</b> 
            <h1>{number}</h1>
            </Grid>
            <Grid item xs={6}> {children}</Grid>
          </Grid>
        
        </Card> 
    </div>
  );
};

export default MetricCard; 
