import { Card, MenuItem, Select, Typography } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Header from "components/Header";
import { AuthContext } from "contexts/Auth";
import firebase from "firebase/app";
import "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { allPerksDict } from "../../constants";
import BChart from "./BarChart";
import MetricCard from "./MetricCard";
import PChart from "./piechart";

const GeneralDashboard = () => {
  const { currentUser } = useContext(AuthContext);

  var [employees, setEmployees] = useState([]);
  var [groups, setGroups] = useState({});
  var [selectedGroup, setSelectedGroup] = useState("All Groups");

  function roundNumber(num) {
    return Math.round(10 * num) / 10;
  }

  function convertGroups() {
    let retArr = Object.keys(groups);
    retArr.push("All Groups");
    return retArr;
  }

  function calculatePieData() {
    let tempDict = {};
    employees.forEach((employee) => {
      let group = employee["group"];
      if (groups[group] === undefined) {
        return 0;
      }
      groups[group].forEach((perk) => {
        if (perk in tempDict) {
          tempDict[perk] += allPerksDict[perk].Cost;
        } else {
          tempDict[perk] = allPerksDict[perk].Cost;
        }
      });
    });
    let data = [];
    let totalValue = 0;
    Object.keys(tempDict).forEach((perk) => {
      let newRow = { name: perk, value: tempDict[perk] };
      totalValue = totalValue + tempDict[perk];
      data.push(newRow);
    });
    let totalPercentage = 100; //Rounds number if all values don't add up to 100
    data.forEach((perkObj) => {
      perkObj.value = roundNumber((perkObj.value / totalValue) * 100);
      totalPercentage -= perkObj.value;
      if (totalPercentage < 0) {
        perkObj.value -= totalPercentage * -1;
      }
    });
    return data;
  }

  function calculateTotalCost() {
    let totalCost = 0;

    let groupCost = {};
    employees.forEach((employee) => {
      let cost = 0;
      let group = employee["group"];
      if (groups[group] === undefined) {
        return 0;
      }
      groups[group].forEach((perk) => {
        cost += allPerksDict[perk].Cost;
      });
      totalCost += cost;
    });
    return totalCost;
  }

  function calculatePerksOffered() {
    let perks = new Set([]);
    Object.keys(groups).forEach((group) => {
      groups[group].forEach((perk) => {
        perks.add(perk);
      });
    });
    return perks.size;
  }

  function calculateBarGraphData() {
    let retData = [];
    let tempDict = {};
    employees.forEach((employee) => {
      let group = employee["group"];
      if (selectedGroup != "All Groups") {
        if (group !== selectedGroup) {
          return 0;
        }
      }
      if (groups[group] === undefined) {
        return 0;
      }
      groups[group].forEach((perk) => {
        if (perk in tempDict) {
          tempDict[perk] += allPerksDict[perk].Cost;
        } else {
          tempDict[perk] = allPerksDict[perk].Cost;
        }
      });
    });
    Object.keys(tempDict).forEach((perk) => {
      let newRow = { name: perk, unspent: tempDict[perk], spent: 0 };
      retData.push(newRow);
    });

    return retData;
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

          db.collection("users")
            .where("businessID", "==", businessId)
            .get()
            .then((querySnapshot) => {
              const people = querySnapshot.docs.map((doc, index) => ({
                email: doc.id,
                id: index,
                group: doc.data()["group"],
                perks: doc.data()["perks"],
              }));
              db.collection("businesses")
                .doc(businessId)
                .get()
                .then((doc) => {
                  const businessDoc = doc.data();
                  if (businessDoc) {
                    setEmployees(people);
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

  function handleGroupChange(event) {
    setSelectedGroup(event.target.value[1]);
  }

  return (
    <div>
      <Header title="Dashboard" crumbs={["General dashboard"]} />
      <Grid container spacing={4}>
        <Grid item xs={4}>
          <MetricCard
            title={"Cost Per Employee"}
            number={"$" + roundNumber(calculateTotalCost() / employees.length)}
            icon={
              <img
                src="/images/undraw_Investing.svg"
                style={{ height: "70px", marginLeft: "auto", display: "block" }}
              />
            }
          />
        </Grid>
        <Grid item xs={4}>
          <MetricCard
            title={"Number of Employees"}
            number={employees.length}
            icon={
              <img
                src="/images/undraw_Appreciation.svg"
                style={{ height: "70px", marginLeft: "auto", display: "block" }}
              />
            }
          />
        </Grid>
        <Grid item xs={4}>
          <MetricCard
            title={"Total Perks Offered"}
            number={calculatePerksOffered()}
            icon={
              <img
                src="/images/undraw_Gifts.svg"
                style={{ height: "70px", marginLeft: "auto", display: "block" }}
              />
            }
          ></MetricCard>
        </Grid>
        <Grid item xs={4}>
          <Card
            style={{
              width: "100%",
              padding: 10,
              height: "500px",
              display: "flex",
              flexFlow: "column",
            }}
            elevation={4}
          >
            <Typography
              variant="h6"
              style={{ height: "80px", padding: "15px", fontWeight: "bold" }}
            >
              Perks Distribution
            </Typography>
            <div style={{ height: "400px" }}>
              <PChart data={calculatePieData()} />
            </div>
          </Card>
        </Grid>
        <Grid item xs={8}>
          <Card
            style={{ width: "100%", padding: 10, height: "500px" }}
            elevation={4}
          >
            <div style={{ width: "100%", height: "100%" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="h6"
                  style={{
                    height: "80px",
                    padding: "15px",
                    fontWeight: "bold",
                  }}
                >
                  Perks Spending
                </Typography>

                <div style={{ marginLeft: "auto" }}>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    displayEmpty
                    variant="outlined"
                    value={[selectedGroup]}
                    onChange={handleGroupChange}
                    multiple
                    fullWidth
                    label="Select Group"
                    placeholder="Select Gruop"
                  >
                    {convertGroups().map((group) => (
                      <MenuItem value={group} key={group}>
                        {group}
                      </MenuItem>
                    ))}
                  </Select>
                </div>
              </div>
              <BChart data={calculateBarGraphData()} />
            </div>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default GeneralDashboard;
