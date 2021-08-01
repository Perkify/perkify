import React from 'react';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

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
  const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#FF7F7F',
    '#CBC3E3',
  ];

  return (
    <ResponsiveContainer width="100%" height="80%">
      <BarChart data={props.data}>
        <XAxis dataKey="name" />
        <YAxis height={100} unit="%" domain={[0, 100]} />
        <Tooltip formatter={(label) => label + ' %'} cursor={false} />
        <Bar
          dataKey="spent"
          name="Spent"
          stackId="a"
          fill="#00C49F"
          maxBarSize={100}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % 20]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BChart;
