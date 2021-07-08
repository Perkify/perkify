import React, { useCallback, useContext } from "react";
import { useState, useEffect } from 'react';

import { withRouter, Redirect } from "react-router";
import app from "./firebaseapp.js";
import { AuthContext } from "./Auth.js";
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom'
import { Select } from 'antd';






import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Form, Input, Button, Checkbox } from 'antd';
import 'antd/dist/antd.css';
import { AutoComplete } from 'antd';




const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
  }));

  const groups = ["A", "B", "C"]

  const randomPerks = [
     'Netflix', 'Instacart',  'Amazon Prime' 
  ];

  const allPerks = ['Netflix', 'Instacart',  'Amazon Prime', "Spotify"]

  function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
  



const AddPerks = ({ history }) => {

    function validateEmails(emailString){
        let emails = emailString.replace(/[,'"]+/gi,' ' ).split(/\s+/)
        let retValue = true
        emails.forEach(email=> {
            if (validateEmail(email) === false){
                retValue = false 
            }
        });
        console.log("WTF")
        return retValue
    }

    const { TextArea } = Input;
    const allPerksView = []
    


    const [selectedPerks, setPerksData] = useState([])



    function getPerksData(){
        //TO IMPLEMENT randomPerks => actual perks of the selected group
        setPerksData(randomPerks)
        console.log(selectedPerks)
        

    }


    useEffect(() => {
        getPerksData()
      });

    function handleChange(value) {
        setPerksData(value)
      }

    const classes = useStyles();
    const layout = {
        labelCol: {
          span: 8,
        },
        wrapperCol: {
          span: 40,
        },
      };
      const tailLayout = {
        wrapperCol: {
          offset: 8,
          span: 50,
        },
      };

      const { Option } = Select;

      
    const handleAddUsers = useCallback(
        //TO IMPLEMENT api call to save user information 
        async event => {
            console.log(event)
            let emails = event.emails
            emails = emails.replace(/[,'"]+/gi,' ' ).split(/\s+/) //Gives email as a list 
            let group = event.group
            let perks = event.addedPerks

            
        },
        [history]
    );

    const { currentUser } = useContext(AuthContext);

    return (


        <div>
         <br></br>

            <Grid container spacing={3}>
        <Grid item xs>
        </Grid>
        <Grid item xs={8} sm={8} style={{height: "650px"}}>
          <br></br>
            <h1 style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "left", textAlign: "center"}}> Add Perks</h1> 

<Form {...layout}

name="basic"
initialValues={{
  remember: true,
}}
onFinish={handleAddUsers}
> 

<div>
    <Grid container spacing={0}>

    <Grid item xs={1}> </Grid>
    <Grid item xs={10}>
    <Grid container spacing={0}>
    <Grid item xs={8}>

     <h4 style={{textAlign:"left"}}>Total Perks</h4> 
     </Grid> 
     <Grid item xs={2} style={{textAlign: "right"}} > 
    </Grid>

    
     </Grid>
    <Form.Item
  label=""
  name="addedPerks"
  rules={[
    {
      required: false,
    },
  ]}
>   <> 
    <Select
    mode="multiple"
    style = {{width: "100%", borderRadius: "5px"}}
    >
     {allPerks.map(perk => <Option value={perk}>{perk}</Option>)}
    </Select>

    </>
</Form.Item>
</Grid> 
<Grid item xs> </Grid>
</Grid>
</div> 



<Grid container spacing={0}>
<Grid item xs={1}> </Grid>
<Grid item xs={10}>





<Form.Item style = {{width: "100%", borderRadius: "5px"}} >
  <Button type="primary" htmlType="submit" style = {{width: "100%", borderRadius: "5px"}}>
    Add Users
  </Button>
</Form.Item>
</Grid>
</Grid>
  </Form>
 





        </Grid>
        <Grid item xs>
        </Grid>
        </Grid>
            
            
        </div>
    );
};

export default AddPerks
