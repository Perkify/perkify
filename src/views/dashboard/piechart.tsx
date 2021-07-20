import React, { PureComponent } from 'react';
import { PieChart, Pie, Sector, ResponsiveContainer, Cell, Tooltip, Legend } from 'recharts';


const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
      </text>
    </g>
  );
};



const PChart = (props) => {

    var [activeIndex, setIndex] = React.useState(0); 
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];


    

    const onPieEnter = (value) => {
        const isIndex = (element) => element.name === value.name;
        setIndex(props.data.findIndex(isIndex))
    };


    return (
      <ResponsiveContainer width="100%" height="80%">
        <PieChart width={400} height={300} margin={{ top: 0, right: 5, bottom: 80, left: 5 }}>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={props.data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={onPieEnter}

          >
          {props.data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
        </Pie>
        <Tooltip formatter={(label) => label + " %"}/>
        <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
}

export default PChart