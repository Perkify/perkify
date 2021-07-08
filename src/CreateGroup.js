import ClippedDrawer from "./VerticalNav";
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
import allPerks from "./constants";
import allPerksDict from "./allPerksDict";


const groups = ["A", "B", "C"]

const randomPerks = [
   'Netflix', 'Instacart',  'Amazon Prime' 
];


function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}







const CreateGroup = ({ history }) => {

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
    


    const [groupData, setGroupData] = useState([])
    const [selectedPerks, setPerksData] = useState([])
    var [totalCost, setTotalCost] = useState(0)


    function getGroupData(){
        //TO IMPLEMENT with group data set groupData = all perks a group should hold onto 
        setGroupData(groups)
      }

    function getPerksData(){
        //TO IMPLEMENT randomPerks => actual perks of the selected group
        setPerksData(randomPerks)
        console.log(selectedPerks)
        

    }

    function getTotalCost(){
      console.log(selectedPerks)
      return 100
    }

    var numPeople = 0 
    var [costPerPerson, setCost] = useState(0)


    useEffect(() => {
        getGroupData() 
        console.log(groupData[0])
      });

    function handleChange(value) {
      console.log(value)
        setPerksData(value)
        var totalCost = 0
        value.forEach(perk => {
          console.log(perk)
          totalCost += allPerksDict[perk].Cost
        });
        setCost(totalCost)
        totalCost = totalCost * numPeople
        setTotalCost(totalCost)
      }
      
      function handleEmailChange(value) {
        if(validateEmails(value.target.value)){
          let emails = value.target.value.replace(/[,'"]+/gi,' ' ).split(/\s+/)
          numPeople = emails.length
          console.log(costPerPerson)
          setTotalCost(emails.length * costPerPerson)
        }
      }

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

    
    var groupsData = []
    var fillerGroupData = [
      {
        name: "A",
        id: "abc123"
      },
      {
        name: "B",
        id: "abc133"
      },
    ]


    function getGroupsData(){
        //TO IMPLEMENT 
        groupsData = fillerGroupData
      }

      getGroupsData()

    return (
      <ClippedDrawer groups={groupsData}>

          <div>

            <Grid container spacing={3}>
        <Grid item xs>
        </Grid>
        <Grid item xs={8} sm={8} md={6} lg={5} style={{height: "650px"}}>
          <br></br>
            <h1 style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "left", textAlign: "center"}}> Create Group</h1> 

<Form

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
    <h4 style={{textAlign:"left"}}>Group Name</h4> 
<Form.Item
  label=""
  name="groupName"
  rules={[
    {
      required: true,
      message: 'Please input a group name!',
    },
  ]}
  
>
  <Input style = {{width: "100%", borderRadius: "5px"}} />
</Form.Item>
</Grid> 
<Grid item xs> </Grid>
</Grid>
</div> 

    <div>
    <Grid container spacing={0}>

    <Grid item xs={1}> </Grid>
    <Grid item xs={10}>
    <h4 style={{textAlign:"left"}}>Paste Emails Below</h4> 
<Form.Item
  label=""
  name="emails"
  onChange ={handleEmailChange}
  rules={[
    ({ getFieldValue }) => ({
        validator(_, value) {
            if (value === ""){
                return Promise.reject(new Error('Please input atleast one email'));
              }
          if (validateEmails(value)){
            return Promise.resolve();
          }
          else{
            return Promise.reject(new Error('Please input proper emails'));
          }
        },
      }),
  ]}
  
>
<TextArea placeholder="Paste emails as CSV or seperated by a line" rows={5} allowClear style = {{width: "100%", borderRadius: "5px"}}/>
</Form.Item>
</Grid> 
<Grid item xs> </Grid>
</Grid>
</div> 
<div>
    <Grid container spacing={0}>

    <Grid item xs={1}> </Grid>
    <Grid item xs={10}>
    <Grid container spacing={0}>
    <Grid item xs={8}>

     <h4 style={{textAlign:"left"}}>Perks</h4> 
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
    value = {selectedPerks}
    onChange = {handleChange}
    >
     {allPerks.map(perk => <Option value={perk["Name"]}>{perk["Name"]}</Option>)}
    </Select>

    </>
</Form.Item>
</Grid> 
<Grid item xs> </Grid>
</Grid>
</div> 

<div>
    <Grid container spacing={0}>

    <Grid item xs={1}> </Grid>
    <Grid item xs={10}>
    <Grid container spacing={0}>
    <Grid item xs={8}>

     <h4 style={{textAlign:"left"}}>Total Cost: {totalCost}</h4> 
     </Grid> 
     <Grid item xs={2} style={{textAlign: "right"}} > 
    </Grid>

    
     </Grid>
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
      </ClippedDrawer>
    );
  }
  
  export default CreateGroup
