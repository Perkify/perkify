import React from "react";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  {
    name: "Perk A",
    uv: 4000,
    pv: 2400,
  },
  {
    name: "Perk B",
    uv: 3000,
    pv: 1398,
  },
  {
    name: "Perk C",
    uv: 2000,
    pv: 9800,
  },
  {
    name: "Perk D",
    uv: 2780,
    pv: 3908,
  },
  {
    name: "Perk E",
    uv: 1890,
    pv: 4800,
  },
  {
    name: "Perk F",
    uv: 2390,
    pv: 3800,
  },
  {
    name: "Page G",
    uv: 3490,
    pv: 4300,
  },
];

const BChart = (props) => {
  return (
    <ResponsiveContainer width="100%" height="80%">
      <BarChart data={props.data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip cursor={false} />
        <Legend />
        <Bar
          dataKey="Spent"
          stackId="a"
          fill="#00C49F"
          radius={[0, 0, 10, 10]}
          maxBarSize={20}
        />
        <Bar
          dataKey="Unspent"
          stackId="a"
          fill="#185CFF"
          radius={[10, 10, 0, 0]}
          maxBarSize={20}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BChart;
