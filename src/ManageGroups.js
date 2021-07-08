import React, {useState, useEffect} from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom";
import ClippedDrawer from "./VerticalNav";
import { DataGrid } from '@material-ui/data-grid';
import Grid from '@material-ui/core/Grid';
import { Form, Input, Button, Checkbox } from 'antd';
import { Modal, Tabs } from 'antd';
import RemovePerks from "./RemovePerks";
import AddPerks from "./AddPerks";

const columns = [
    {
      field: 'firstName',
      headerName: 'First name',
      width: 150,
      editable: false,
    },
    {
      field: 'lastName',
      headerName: 'Last name',
      width: 150,
      editable: false,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 300,
      editable: false,
    },
    {
        field: 'extras',
        headerName: 'Extras',
        width: 400,
        editable: false,
      },
  ];

  const rows = [
    { id: 1, lastName: 'Snow', firstName: 'Jon', email: "jerry1ye10@gmail.com", extras: "Netflix, Perkify, Bloomberg, TV, NYT"},
    { id: 2, lastName: 'Lannister', firstName: 'Cersei', email: "jerry1ye10@gmail.com"},
    { id: 3, lastName: 'Lannister', firstName: 'Jaime', email: "jerry1ye10@gmail.com" },
    { id: 4, lastName: 'Stark', firstName: 'Arya', email: "jerry1ye10@gmail.com" },
    { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', email: "jerry1ye10@gmail.com" },
    { id: 6, lastName: 'Melisandre', firstName: null, email: "jerry1ye10@gmail.com" },
    { id: 7, lastName: 'Clifford', firstName: 'Ferrara', email: "jerry1ye10@gmail.com" },
    { id: 8, lastName: 'Frances', firstName: 'Rossini', email: "jerry1ye10@gmail.com"},
    { id: 9, lastName: 'Roxie', firstName: 'Harvey', email: "jerry1ye10@gmail.com" },
  ];

  const perkColumns = [
    {
      field: 'perks',
      headerName: 'Perks',
      width: 150,
      editable: false,
    },
    {
      field: 'cost',
      headerName: 'Cost',
      width: 150,
      editable: false,
    },
    {
      field: 'period',
      headerName: 'Period',
      width: 150,
      editable: false,
    }
  ];


  export default function ManageGroups()  
{

  let { id } = useParams();
  
    const [peopleData, setPeopleData] = useState([])

    const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [selectedPerks, setSelection] = useState([])
    const [groupPerks, setPerksData] = useState([])

    const randomPerks = [
        'Netflix', 'Instacart',  'Amazon Prime' 
     ];



    const showRemoveModal = () => {
        console.log(selectedPerks)
        if (selectedPerks.length === 0){
            return
        }
      setIsRemoveModalVisible(true);
    };

    const showAddModal = () => {
        setIsAddModalVisible(true);
      };
  
    const handleOk = () => {
      setIsRemoveModalVisible(false);
      setIsAddModalVisible(false);

    };
  
    const handleCancel = () => {
      setIsRemoveModalVisible(false);
      setIsAddModalVisible(false);
    };

    function getPeopleRowData(){
        //TO IMPLEMENT GET DATA BASED ON GROUP & SETPEOPLEDATA TO IT 
        setPeopleData(rows)
      }

      var groupData = []
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

      function getGroupData(){
        //TO IMPLEMENT 
        groupData = fillerGroupData
      }

      

      getGroupData()

      useEffect(() => {
        getPeopleRowData() 
        getPerksData()
        
      }, []);
      
      
      function getRemovedPerks(){
        var removedPerks = []
        selectedPerks.forEach(index => {
            removedPerks.push(groupPerks[index])
        });
        return removedPerks
    }

    function getPerksData(){
        //TO IMPLEMENT randomPerks => actual perks of the selected group
        setPerksData(randomPerks)
    }


    return (
        <>
        <ClippedDrawer groups={groupData}>
            <div style={{width: 500}}> 
            <Grid container spacing={0} justifyContent="center" alignItems="center">
            <Grid item xs={6} md={8}>
            <h1>Manage Groups</h1> 
            </Grid>

            </Grid> 

            <Grid container spacing={0} justifyContent="center" alignItems="center">
            <Grid item xs={4} md={6}>
            <h2>Group Perks</h2> 
            </Grid>
            <Grid item xs={3} alignItems="flex-end" justifyContent="center"><Button type="primary" onClick={showAddModal} htmlType="submit" style = {{width: "80%", borderRadius: "5px", alignText: "center", height: "40px"}}>
    Add
  </Button></Grid>

  <Grid item xs={3}><Button type="primary" onClick={showRemoveModal} htmlType="submit" style = {{width: "80%", borderRadius: "5px", height: "40px", alignText: "center"}}>
    Remove
  </Button></Grid>
  </Grid> 
  </div> 
  <br></br>


         <div style={{ height: 300, width: 500}}>
          <DataGrid
            rows={peopleData}
            columns={perkColumns}
            pageSize={100}
            checkboxSelection
            onSelectionModelChange={(newSelection) => {
                setSelection(newSelection.selectionModel);
              }}
          />
        </div>
        
        <br></br> 

            <Grid container spacing={0} justifyContent="center" alignItems="center">
            <Grid item xs={6} md={8}>
            <h2>Group Members</h2> 
            </Grid>

            </Grid>
        <div style={{ height: 500 }}>
          <DataGrid
            rows={peopleData}
            columns={columns}
            pageSize={100}
          />
        </div>
        </ClippedDrawer>
        <Modal visible={isRemoveModalVisible} onOk={handleOk} onCancel={handleCancel} footer={null}><><RemovePerks perks={getRemovedPerks()}></RemovePerks></></Modal> 
        <Modal visible={isAddModalVisible} onOk={handleOk} onCancel={handleCancel} footer={null}><><AddPerks></AddPerks></></Modal> 

</> 
      
);
    }

