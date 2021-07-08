import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

const AdminForm = (props) => {
    const fillTextbox = (setFunction) => (
        (event) => {setFunction(event.target.value)}
    )

    return (
        <React.Fragment>
            <Typography variant="h6" gutterBottom>
                Admin Info
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <TextField
                        required
                        id="firstName"
                        label="First Name"
                        fullWidth
                        variant="outlined"
                        onChange={fillTextbox(props.setFirstName)}
                        value={props.firstName}
                        autoComplete="cc-name"
                        error = {props.firstName==="" && props.invalidStep}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        required
                        id="lastName"
                        label="Last Name"
                        fullWidth
                        variant="outlined"
                        onChange={fillTextbox(props.setLastName)}
                        value={props.lastName}
                        autoComplete="cc-name"
                        error = {props.lastName==="" && props.invalidStep}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        required
                        id="email"
                        label="Email"
                        fullWidth
                        variant="outlined"
                        onChange={fillTextbox(props.setEmail)}
                        value={props.email}
                        autoComplete="cc-name"
                        error = {props.email==="" && props.invalidStep}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        required
                        id="pass"
                        label="Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        onChange={fillTextbox(props.setPassword)}
                        value={props.password}
                        autoComplete="current-password"
                        error = {props.password==="" && props.invalidStep}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        required
                        id="dob"
                        label="Date of Birth"
                        type="date"
                        variant="outlined"
                        onChange={fillTextbox(props.setDob)}
                        value={props.dob}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        error = {props.dob==="" && props.invalidStep}
                    />
                </Grid>
            </Grid>
        </React.Fragment>
    );
};

export default AdminForm;
