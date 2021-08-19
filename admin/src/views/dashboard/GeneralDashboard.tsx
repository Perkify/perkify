import {
  Button,
  Card,
  Grid,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';
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

  function roundNumberHundredth(num) {
    return Math.round(100 * num) / 100;
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
      let newRow = {
        name: perk,
        spent: calculateAmountSpentPerPerk(perk),
        total: 100,
      };
      retData.push(newRow);
    });

    return retData;
  }

  function calculateAmountSpentPerPerk(perk) {
    let totalPossibleCost = 0;
    let moneySpent = 0;
    console.log(employees);
    employees.forEach((employee) => {
      if (employee.perks[perk]) {
        console.log('changing');
        totalPossibleCost += allPerksDict[perk].Cost;
        if (didSpendPerkLastMonth(employee.perks[perk])) {
          moneySpent += allPerksDict[perk].Cost;
        }
      }
    });
    moneySpent *= 100;
    return Math.round(moneySpent / totalPossibleCost);
  }

  function didSpendPerkLastMonth(employeeArray) {
    if (employeeArray.length == 0) {
      return false;
    }
    let today = new Date();
    today.setMonth(today.getMonth() - 1);
    employeeArray.sort((a, b) => a.toDate().getTime() - b.toDate().getTime());
    if (
      employeeArray[employeeArray.length - 1].toDate().getTime() >
      today.getTime()
    ) {
      return true;
    }
    return false;
  }

  function generateCSV() {
    let d = new Date();
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    var arrayContent = [
      [
        'Employee',
        'Total spent in ' + monthNames[d.getMonth()],
        'Total spent in ' + d.getFullYear(),
      ],
    ];
    employees.forEach((employee) => {
      let monthlyCost = 0;
      let yearlyCost = 0;
      Object.keys(employee['perks']).forEach((perk) => {
        employee['perks'][perk].forEach((date) => {
          if (d.getFullYear() === date.toDate().getFullYear()) {
            yearlyCost += allPerksDict[perk].Cost;
          }
          if (d.getMonth() === date.toDate().getMonth()) {
            monthlyCost += allPerksDict[perk].Cost;
          }
        });
      });
      let newRow = [
        employee.email,
        roundNumberHundredth(monthlyCost),
        roundNumberHundredth(yearlyCost),
      ];
      arrayContent.push(newRow);
    });
    var csvContent = arrayContent.join('\n');
    var link = window.document.createElement('a');
    link.setAttribute(
      'href',
      'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csvContent)
    );
    link.setAttribute('download', 'employee_spending.csv');
    link.click();
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
          setDashboardLoading(false);
        })
        .catch((error) => {
          alert(error);
        });
    } else {
      console.info('No such document!');
    }
    return () => setDashboardLoading(false);
  }, [currentUser, admin, business]);

  // useEffect(() => {
  //   if (hasPaymentMethods != null) {
  //     setDashboardLoading(false);
  //   }
  // }, [hasPaymentMethods]);

  function handleGroupChange(event) {
    setSelectedGroup(event.target.value[1]);
  }

  return (
    <div>
      <Grid container spacing={0}>
        <Grid item xs={10}>
          <Header title="Dashboard" crumbs={['General', 'Dashboard']} />
        </Grid>
        <Grid item xs={2}>
          <Button variant="contained" color="primary" onClick={generateCSV}>
            Download Financial Records
          </Button>
        </Grid>
      </Grid>
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
              title={'Average Cost Per Employee'}
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
