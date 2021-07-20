import React, { PureComponent } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {Select} from "@material-ui/core";

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
  {
    name: 'Perk D',
    uv: 2780,
    pv: 3908,
  },
  {
    name: 'Perk E',
    uv: 1890,
    pv: 4800,
  },
  {
    name: 'Perk F',
    uv: 2390,
    pv: 3800,
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
  },
];

const BChart = (props) => {

    return (
      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          width={500}
          height={300}
          data={props.data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        > 
        <XAxis dataKey="name" />
          <YAxis />
          <Tooltip cursor={false}/>
          <Legend />
          <Bar dataKey="Spent" stackId="a" fill="#8884d8" />
          <Bar dataKey="Unspent" stackId="a" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

export default BChart
