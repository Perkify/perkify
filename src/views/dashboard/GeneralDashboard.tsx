import Header from "components/Header";
import React, {useEffect, useContext, useState} from "react";
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
import MetricCard from "./MetricCard";
import PersonIcon from '@material-ui/icons/Person';
import PChart from "./piechart";
import BChart from "./BarChart";
import CardMembershipIcon from '@material-ui/icons/CardMembership';
import { AuthContext } from "contexts/Auth";
import firebase from "firebase/app";
import "firebase/firestore";
import { allPerks, allPerksDict } from "../../constants";



const GeneralDashboard = () => {

  

  const { currentUser } = useContext(AuthContext);

  var [employees, setEmployees] = useState([])
  var [groups, setGroups] = useState({})
  var [selectedGroup, setSelectedGroup] = useState(")

  function roundNumber(num){
    return Math.round(10*num)/10; 
  }

  function calculatePieData(){
    let tempDict = {}
    employees.forEach(employee => {
      let group = employee["group"]
      if (groups[group] === undefined){
        return 0
      }
      groups[group].forEach(perk => {
        if (perk in tempDict){
          tempDict[perk] += allPerksDict[perk].Cost
        }
        else{
          tempDict[perk] = allPerksDict[perk].Cost
        }
      })
    }
    )
    let data = []
    let totalValue = 0 
    Object.keys(tempDict).forEach(perk => {
      let newRow = {name: perk, value: tempDict[perk]}
      totalValue = totalValue + tempDict[perk]
      data.push(newRow)
    }
    )
    console.log(tempDict)
    let totalPercentage = 100 //Rounds number if all values don't add up to 100 
    data.forEach(perkObj => {
      perkObj.value = roundNumber((perkObj.value / totalValue) * 100)
      totalPercentage -= perkObj.value
      console.log(totalPercentage)
      if (totalPercentage < 0){
        perkObj.value -= (totalPercentage * -1) 
      }
    })
    return data
  }

  function calculateTotalCost(){
    let totalCost = 0 
    
    let groupCost = {}
    employees.forEach(employee => {
      let cost = 0 
      let group = employee["group"]
      console.log(groups)
      console.log(group)
      console.log(groups[group])
      if (groups[group] === undefined){
        return 0
      }
      groups[group].forEach(perk => {
        cost += allPerksDict[perk].Cost
      })
      totalCost += cost
    })
    return totalCost
  }

  function calculatePerksOffered(){
    let perks = new Set([])
    Object.keys(groups).forEach(group => {
      groups[group].forEach(perk => {
        perks.add(perk)
      })
    })
    return perks.size
  }

  function calculateBarGraphData(){
    const data = [
      {
        name: 'Perk A',
        uv: 4000,
        pv: 2400,
      },
      {
        name: 'Perk B',
        uv: 3000,
        pv: 1398,
      },
      {
        name: 'Perk C',
        uv: 2000,
        pv: 9800,
      },
    ];

    let retData = [] 
    let tempDict = {}
    employees.forEach(employee => {
      let group = employee["group"]
      if (groups[group] === undefined){
        return 0
      }
      groups[group].forEach(perk => {
        if (perk in tempDict){
          tempDict[perk] += allPerksDict[perk].Cost
        }
        else{
          tempDict[perk] = allPerksDict[perk].Cost
        }
      })
    }
    )
    Object.keys(tempDict).forEach(perk => {
      let newRow = {name: perk, Unspent: tempDict[perk], Spent: 0}
      retData.push(newRow)
    }
    )

    return retData
  }

  useEffect(() => {
    const db = firebase.firestore();
    db.collection("admins")
      .doc(currentUser.uid)
      .get()
      .then((doc) => {
        const userData = doc.data();
        if (userData) {
          const businessId = userData["companyID"];
          console.log("Business ID");
          console.log(businessId);

          db.collection("users")
            .where("businessID", "==", businessId)
            .get()
            .then((querySnapshot) => {
              const people = querySnapshot.docs.map((doc, index) => ({
                email: doc.id,
                id: index,
                group: doc.data()["group"],
                perks: doc.data()["perks"]
              }));
              console.log(people)
              db.collection("businesses")
              .doc(businessId)
              .get()
              .then((doc) => {
                const businessDoc = doc.data();
                if (businessDoc) {
                  console.log(businessDoc.groups);
                  setEmployees(people)
                  setGroups(businessDoc.groups);
                }
              });
            })
            .catch((error) => {
              alert(error);
            });
        } else {
          console.log("No such document!");
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  }, []);

  return (
    <div>
      <Header title="Dashboard" crumbs={["General dashboard"]} />
      <Grid
        container
        spacing={0}
        direction= "row"
      >

        <Grid item xs ={4}> 
          <MetricCard title={"Cost Per Employee"} number={calculateTotalCost() / employees.length}> <PaymentIcon style={{display: "block", margin: "auto", width: 100, height: 70, color: "blue"}}></PaymentIcon> </MetricCard>
        </Grid>
        <Grid item xs ={4}>  
        <MetricCard title={"Number of Employees"} number={employees.length}> <PersonIcon style={{display: "block", margin: "auto", width: 100, height: 70, color: "blue"}}> </PersonIcon> </MetricCard> 
        </Grid>
        <Grid item xs ={4}> 
          <MetricCard title={"Total Perks Offered"} number={calculatePerksOffered()}> <CardMembershipIcon style={{display: "block", margin: "auto", width: 100, height: 70, color: "blue"}}> </CardMembershipIcon> </MetricCard> 
        </Grid>
        </Grid> 

        <br/> 
        <Grid
        container
        spacing={0}
        direction= "row"
      >
        <Grid item xs={4}> 
          <Card style={{ width: "95%", padding: 10, height: 400 }} elevation={4} > <div style={{width: "100%", height: "100%"}}><h1 style={{marginLeft: 10}}>Perks</h1>
          <PChart data={calculatePieData()}/> </div></Card>
        </Grid> 
        <Grid item xs={8}> 
        <Card style={{ width: "95%", padding: 10, height: 400 }} elevation={4}><div style={{width: "100%", height: "100%"}}> <h1 style={{marginLeft: 10}}>Perks</h1>
          <BChart data={calculateBarGraphData()}/></div> </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default GeneralDashboard;
