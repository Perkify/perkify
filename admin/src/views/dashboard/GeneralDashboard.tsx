import { Card, Grid, MenuItem, Select, Typography } from '@material-ui/core';
import Header from 'components/Header';
import { AuthContext, BusinessContext, LoadingContext } from 'contexts';
import { db } from 'firebaseApp';
import React, { useContext, useEffect, useState } from 'react';
import { allPerksDict } from 'shared';
import BChart from './BarChart';
import { CreatePerkGroupCard } from './CreatePerkGroupCard';
import MetricCard from './MetricCard';
import PChart from './piechart';
import { WelcomeCards } from './WelcomeCards';

const GeneralDashboard = () => {
  const { currentUser, admin, hasPaymentMethods, loadingAuthState } =
    useContext(AuthContext);
  const { business } = useContext(BusinessContext);
  const { dashboardLoading, setDashboardLoading } = useContext(LoadingContext);

  var [employees, setEmployees] = useState([]);
  var [selectedGroup, setSelectedGroup] = useState('All Groups');

  function roundNumber(num) {
    return Math.round(10 * num) / 10;
  }

  function convertGroups() {
    if (dashboardLoading) {
      return [];
    }
    let retArr = Object.keys(business.groups);
    retArr.push('All Groups');
    return retArr;
  }

  function calculatePieData() {
    // Returns pie chart data
    if (dashboardLoading) {
      return [];
    }
    let tempDict = {};
    employees.forEach((employee) => {
      //Looks through each employee to create dict of total costs per perk
      let group = employee['group'];
      if (
        business.groups === undefined ||
        business.groups[group] === undefined
      ) {
        return 0;
      }
      business.groups[group].forEach((perk) => {
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
      //Creates array of total cost per perk
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
    if (dashboardLoading) {
      return 0;
    }
    //Calculates total cost to display cost per employee
    let totalCost = 0;
    if (business.groups === undefined) {
      return 0;
    }
    let groupCost = {};
    employees.forEach((employee) => {
      let cost = 0;
      let group = employee['group'];
      if (business.groups[group] === undefined) {
        return 0;
      }
      business.groups[group].forEach((perk) => {
        cost += allPerksDict[perk].Cost;
      });
      totalCost += cost;
    });
    return totalCost / employees.length;
  }

  function calculatePerksOffered() {
    if (dashboardLoading) {
      return 0;
    }
    //returns num of perks offered
    let perks = new Set([]);
    Object.keys(business.groups).forEach((group) => {
      business.groups[group].forEach((perk) => {
        perks.add(perk);
      });
    });
    return perks.size;
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function calculateBarGraphData() {
    //returns bar graph data in array form
    let retData = [];
    if (dashboardLoading) {
      return retData;
    }
    let tempDict = {};
    employees.forEach((employee) => {
      //Creates dictionary of total amount spent per perk
      let group = employee['group'];
      if (selectedGroup != 'All Groups') {
        //If group is selected only look at employees belonging to the selected group
        if (group !== selectedGroup) {
          return 0;
        }
      }
      if (business.groups[group] === undefined) {
        return 0;
      }
      business.groups[group].forEach((perk) => {
        if (perk in tempDict) {
          tempDict[perk] += allPerksDict[perk].Cost;
        } else {
          tempDict[perk] = allPerksDict[perk].Cost;
        }
      });
    });
    Object.keys(tempDict).forEach((perk) => {
      //TODO: Calculate amount spent in comparison to amount not spent
      let newRow = { name: perk, spent: getRandomInt(100), total: 100 };
      retData.push(newRow);
    });

    return retData;
  }

  useEffect(() => {
    setDashboardLoading(true);
    if (Object.keys(admin).length != 0 && business) {
      const businessId = admin['companyID'];

      db.collection('users')
        .where('businessID', '==', businessId)
        .get()
        .then((querySnapshot) => {
          const people = querySnapshot.docs.map((doc, index) => ({
            email: doc.id,
            id: index,
            group: doc.data()['group'],
            perks: doc.data()['perks'],
          }));
          setEmployees(people);
        })
        .catch((error) => {
          alert(error);
        });
    } else {
      console.info('No such document!');
    }
  }, [currentUser, admin, business]);

  useEffect(() => {
    if (hasPaymentMethods != null) {
      setDashboardLoading(false);
    }
  }, [hasPaymentMethods]);

  function handleGroupChange(event) {
    setSelectedGroup(event.target.value[1]);
  }

  return (
    <div>
      <Header title="Dashboard" crumbs={['General', 'Dashboard']} />

      {loadingAuthState || hasPaymentMethods == null ? (
        <p>Loading</p>
      ) : !(hasPaymentMethods == true) ? (
        <WelcomeCards />
      ) : business['groups'] == null ||
        Object.keys(business['groups']).length == 0 ? (
        <CreatePerkGroupCard />
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <MetricCard
              title={'Cost Per Employee'}
              number={'$' + roundNumber(calculateTotalCost())}
            />
          </Grid>
          <Grid item xs={4}>
            <MetricCard
              title={'Number of Employees'}
              number={employees.length}
            />
          </Grid>
          <Grid item xs={4}>
            <MetricCard
              title={'Total Perks Offered'}
              number={calculatePerksOffered()}
            ></MetricCard>
          </Grid>
          <Grid item xs={4}>
            <Card
              style={{
                width: '100%',
                padding: 10,
                height: '500px',
                display: 'flex',
                flexFlow: 'column',
              }}
              elevation={4}
            >
              <Typography
                variant="h6"
                style={{ height: '80px', padding: '15px', fontWeight: 'bold' }}
              >
                Total Perks Allocation
              </Typography>
              <div style={{ height: '400px' }}>
                <PChart data={calculatePieData()} />
              </div>
            </Card>
          </Grid>
          <Grid item xs={8}>
            <Card
              style={{ width: '100%', padding: 10, height: '500px' }}
              elevation={4}
            >
              <div style={{ width: '100%', height: '100%' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="h6"
                    style={{
                      height: '80px',
                      padding: '15px',
                      fontWeight: 'bold',
                    }}
                  >
                    Percentage of Perks Claimed
                  </Typography>

                  <div style={{ marginLeft: 'auto' }}>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      displayEmpty
                      variant="outlined"
                      value={[selectedGroup]}
                      onChange={handleGroupChange}
                      multiple
                      fullWidth
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
      )}
    </div>
  );
};

export default GeneralDashboard;
