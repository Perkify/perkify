import React, { useState, useEffect } from 'react';
import ClippedDrawer from "./VerticalNav";
import { DataGrid } from '@material-ui/data-grid';
import Grid from '@material-ui/core/Grid';
import { Form, Input, Button, Checkbox } from 'antd';
import { Modal, Tabs } from 'antd';
import Login from './Login';
import RemoveUsers from './RemoveUsers';
import AddUsers from './AddUsers';

import 'antd/dist/antd.css';
import { LocalConvenienceStoreOutlined } from '@material-ui/icons';




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
        field: 'group',
        headerName: 'Group',
        width: 200,
        editable: false,
      },
    {
        field: 'extras',
        headerName: 'Extras',
        width: "50%",
        editable: false,
      },
  ];

  
  const rows = [
    { id: 1, lastName: 'Snow', firstName: 'Jon', email: "jerry1ye10@gmail.com", group: "A", extras: "Netflix, Perkify, Bloomberg, TV, NYT"},
    { id: 2, lastName: 'Lannister', firstName: 'Cersei', email: "jerry1ye10@gmail.com"},
    { id: 3, lastName: 'Lannister', firstName: 'Jaime', email: "jerry1ye10@gmail.com" },
    { id: 4, lastName: 'Stark', firstName: 'Arya', email: "jerry1ye10@gmail.com" },
    { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', email: "jerry1ye10@gmail.com" },
    { id: 6, lastName: 'Melisandre', firstName: null, email: "jerry1ye10@gmail.com" },
    { id: 7, lastName: 'Clifford', firstName: 'Ferrara', email: "jerry1ye10@gmail.com" },
    { id: 8, lastName: 'Frances', firstName: 'Rossini', email: "jerry1ye10@gmail.com"},
    { id: 9, lastName: 'Roxie', firstName: 'Harvey', email: "jerry1ye10@gmail.com" },
  ];

  


  export default function ManagePeople() 
{

   
    const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [selectedUsers, setSelection] = useState([])


    const showRemoveModal = () => {
        console.log(selectedUsers)
        if (selectedUsers.length === 0){
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

    function getRemovedUserEmails(){
        var removedUsers = []
        selectedUsers.forEach(index => {
            removedUsers.push(peopleData[index].email)
        });
        return removedUsers
    }

    const [peopleData, setPeopleData] = useState([])

    function getRows(){
        //TO IMPLEMENT
        setPeopleData(rows)
      }

    useEffect(() => {
        getRows() 
        console.log(peopleData)
        
      });
    



    return (<>
        <ClippedDrawer>
            <Grid container spacing={0} justifyContent="center" alignItems="center">
            <Grid item xs={6} md={8}>
            <h1>Manage People</h1> 
            </Grid>
            <Grid item xs={3} md={2} alignItems="flex-end" justifyContent="center"><Button type="primary" onClick={showAddModal} htmlType="submit" style = {{width: "80%", borderRadius: "5px", alignText: "center", height: "40px"}}>
    Add People
  </Button></Grid>

  <Grid item xs={3} md={2}><Button type="primary" onClick={showRemoveModal} htmlType="submit" style = {{width: "80%", borderRadius: "5px", height: "40px", alignText: "center"}}>
    Remove People
  </Button></Grid>

            </Grid> 
        <div style={{ height: 500 }}>
          <DataGrid
            rows={peopleData}
            columns={columns}
            pageSize={100}
            checkboxSelection
            onSelectionModelChange={(newSelection) => {
                setSelection(newSelection.selectionModel);
              }}
          />
        </div>
        </ClippedDrawer>
        <Modal visible={isRemoveModalVisible} onOk={handleOk} onCancel={handleCancel} footer={null}><><RemoveUsers users={getRemovedUserEmails()}></RemoveUsers></></Modal> 
        <Modal visible={isAddModalVisible} onOk={handleOk} onCancel={handleCancel} footer={null}><><AddUsers></AddUsers></></Modal> 

        </>
      );
    }

