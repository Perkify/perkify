import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

const BusinessForm = (props) => {
    const fillTextbox = (setFunction) => (
        (event) => {setFunction(event.target.value)}
    )

    return (
        <React.Fragment>
            <Typography variant="h6" gutterBottom>
                Business details
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={12}>
                    <TextField
                        required
                        id="bizName"
                        name="Business Name"
                        label="Businesss name"
                        variant="outlined"
                        fullWidth
                        autoComplete="given-name"
                        onChange={fillTextbox(props.setBusinessName)}
                        value={props.businessName}
                        error = {props.businessName==="" && props.invalidStep}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        required
                        id="address1"
                        name="address1"
                        label="Address line 1"
                        variant="outlined"
                        fullWidth
                        autoComplete="shipping address-line1"
                        onChange={fillTextbox(props.setAddress)}
                        value={props.address}
                        error = {props.address ==="" && props.invalidStep}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        id="city"
                        name="city"
                        label="City"
                        variant="outlined"
                        fullWidth
                        autoComplete="shipping address-level2"
                        onChange={fillTextbox(props.setCity)}
                        value={props.city}
                        error = {props.city ==="" && props.invalidStep}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id="state"
                        name="state"
                        label="State (2 letter code)"
                        variant="outlined"
                        fullWidth
                        inputProps={{ maxLength: 2 }}
                        onChange={fillTextbox(props.setState)}
                        value={props.state}
                        error = {props.state === "" && props.invalidStep}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        id="zip"
                        name="zip"
                        label="Zip / Postal code"
                        variant="outlined"
                        fullWidth
                        autoComplete="shipping postal-code"
                        onChange={fillTextbox(props.setZip)}
                        value={props.zip}
                        error = {props.zip === "" && props.invalidStep}
                    />
                </Grid>
                <Grid item xs={12} sm={6} >
                    <TextField
                        required
                        id="country"
                        name="country"
                        label="Country"
                        variant="outlined"
                        fullWidth
                        autoComplete="shipping country"
                        onChange={fillTextbox(props.setCountry)}
                        value={props.country}
                        error = {props.country === "" && props.invalidStep}
                    />
                </Grid>
                <Grid item xs={12} sm={12} >
                    <TextField
                        required
                        id="phoneNumber"
                        name="Phone Number"
                        label="Phone Number"
                        type="number"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        variant="outlined"
                        fullWidth
                        autoComplete="phone number"
                        onChange={fillTextbox(props.setPhone)}
                        value={props.phone}
                        error = {props.phone === "" && props.invalidStep}
                    />
                </Grid>
            </Grid>
        </React.Fragment>
    );
};

export default BusinessForm;
