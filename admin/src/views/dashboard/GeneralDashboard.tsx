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
import React, { useContext, useEffect, useState } from 'react';
import { db } from 'services';
import { allPerksDict } from 'shared';
import BChart from './BarChart';
import { CreatePerkGroupCard } from './CreatePerkGroupCard';
import MetricCard from './MetricCard';
import PChart from './piechart';
import { WelcomeCards } from './WelcomeCards';

interface DashboardUser {
  email: string;
  id: string;
  group: string;
  perks: PerkUsesDict;
}

const GeneralDashboard = () => {
  const { currentUser, admin, loadingAuthState } = useContext(AuthContext);
  const { business } = useContext(BusinessContext);
  const { dashboardLoading, setDashboardLoading } = useContext(LoadingContext);

  var [employees, setEmployees] = useState<DashboardUser[]>([]);
  var [selectedGroup, setSelectedGroup] = useState('All Perk Groups');

  function roundNumber(num: any) {
    return Math.round(10 * num) / 10;
  }

  function roundNumberHundredth(num: any) {
    return Math.round(100 * num) / 100;
  }

  function convertGroups() {
    if (dashboardLoading) {
      return [];
    }
    let retArr = Object.keys(business.perkGroups);
    retArr.push('All Perk Groups');
    return retArr;
  }

  function calculatePieData() {
    // Returns pie chart data
    if (dashboardLoading) {
      return [];
    }
    let tempDict: { [key: string]: number } = {};
    Object.keys(business.perkGroups).forEach((group) => {
      let localGroup = business.perkGroups[group];
      localGroup.perkNames.forEach((perk) => {
        if (perk in tempDict) {
          tempDict[perk] += allPerksDict[perk].Cost;
        } else {
          tempDict[perk] = allPerksDict[perk].Cost;
        }
      });
    });
    let data: { name: string; value: number }[] = [];
    let totalValue = 0;
    Object.keys(tempDict).forEach((perk) => {
      //Creates array of total cost per perk
      let newRow = { name: perk, value: tempDict[perk] };
      totalValue = totalValue + tempDict[perk];
      data.push(newRow);
    });
    console.log(data);
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
    let numEmployees = 0;
    if (business.perkGroups === undefined) {
      return 0;
    }
    Object.keys(business.perkGroups).forEach((group) => {
      let localGroup = business.perkGroups[group];
      localGroup.perkNames.forEach((perk) => {
        totalCost +=
          allPerksDict[perk].Cost * localGroup.userEmails.length * 1.1;
      });
      totalCost += localGroup.userEmails.length * 4;
      numEmployees += localGroup.userEmails.length;
    });
    if (numEmployees == 0) {
      return 0;
    }
    return totalCost / numEmployees;
  }

  function calculatePerksOffered() {
    if (dashboardLoading) {
      return 0;
    }
    //returns num of perks offered
    let perks = new Set([]);
    Object.keys(business.perkGroups).forEach((group) => {
      business.perkGroups[group].perkNames.forEach((perk) => {
        perks.add(perk);
      });
    });

    return perks.size;
  }

  function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  function calculateBarGraphData() {
    //returns bar graph data in array form
    let retData: { name: string; spent: number; total: number }[] = [];
    if (dashboardLoading) {
      return retData;
    }
    let tempDict: { [key: string]: number } = {};
    let numTempDict: { [key: string]: number } = {};
    Object.keys(business.perkGroups).forEach((group) => {
      let localGroup = business.perkGroups[group];
      localGroup.perkNames.forEach((perk) => {
        if (perk in tempDict) {
          tempDict[perk] += allPerksDict[perk].Cost;
          numTempDict[perk] += localGroup.userEmails.length;
        } else {
          tempDict[perk] = allPerksDict[perk].Cost;
          numTempDict[perk] = localGroup.userEmails.length;
        }
      });
    });
    Object.keys(tempDict).forEach((perk) => {
      let newRow = {
        name: perk,
        spent: calculateAmountSpentPerPerk(perk, numTempDict[perk]),
        total: 100,
      };
      retData.push(newRow);
    });

    return retData;
  }

  function calculateAmountSpentPerPerk(perk: string, totalPeople: number) {
    let numPeople = 0;
    employees.forEach((employee) => {
      if (employee.perks[perk]) {
        if (didSpendPerkLastMonth(employee.perks[perk])) {
          numPeople += 1;
        }
      }
    });
    if (totalPeople == 0) {
      return 0;
    }
    return Math.round(numPeople / totalPeople);
  }

  function didSpendPerkLastMonth(employeeArray: PerkUses) {
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
      Object.keys(employee.perks).forEach((perk) => {
        employee.perks[perk].forEach((date: any) => {
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
        roundNumberHundredth(monthlyCost).toString(),
        roundNumberHundredth(yearlyCost).toString(),
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
    if (admin && business) {
      const businessId = admin['businessID'];

      db.collection('users')
        .where('businessID', '==', businessId)
        .get()
        .then((querySnapshot) => {
          const people = querySnapshot.docs.map((doc, index) => {
            const userData = doc.data() as User;
            return {
              email: doc.id,
              id: doc.id,
              group: userData.perkGroupName,
              perks: userData.perkUsesDict,
            };
          });
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

  function handleGroupChange(event: any) {
    setSelectedGroup(event.target.value[1]);
  }

  function calculateNumEmployees() {
    let retNum = 0;
    Object.keys(business.perkGroups).forEach((group) => {
      retNum += business.perkGroups[group].userEmails.length;
    });
    return retNum;
  }

  return (
    <div>
      <Grid container spacing={0}>
        <Grid item xs={10}>
          <Header title="Dashboard" crumbs={['General', 'Dashboard']} />
        </Grid>
        <Grid item xs={2}>
          {business &&
            Object.keys(business.cardPaymentMethods).length != 0 &&
            Object.keys(business.perkGroups).length != 0 && (
              <Button color="primary" onClick={generateCSV}>
                Download Financial Records
              </Button>
            )}
        </Grid>
      </Grid>
      {loadingAuthState || !business ? (
        <p>Loading</p>
      ) : Object.keys(business.cardPaymentMethods).length == 0 ? (
        <WelcomeCards />
      ) : business.perkGroups == null ||
        Object.keys(business.perkGroups).length == 0 ? (
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
              number={calculateNumEmployees().toString()}
            />
          </Grid>
          <Grid item xs={4}>
            <MetricCard
              title={'Total Perks Offered'}
              number={calculatePerksOffered().toString()}
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
