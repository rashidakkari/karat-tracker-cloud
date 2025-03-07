
import React from 'react';
import {
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
  PieChart as RechartsPieChart,
  Bar,
  Line,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

export interface ChartProps {
  data: any[];
  width?: number | string;
  height?: number | string;
  className?: string;
  categories?: string[];
  index?: string;
  colors?: string[];
  valueFormatter?: (value: any) => string;
  category?: string;
}

export const BarChart = ({
  data,
  width = '100%',
  height = 300,
  className = '',
  categories = ['value'],
  index = 'name',
  colors = ['#8884d8'],
  valueFormatter = (value) => value.toString()
}: ChartProps) => {
  return (
    <ResponsiveContainer width={width} height={height} className={className}>
      <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={index} />
        <YAxis />
        <Tooltip formatter={valueFormatter} />
        <Legend />
        {categories.map((category, i) => (
          <Bar key={category} dataKey={category} fill={colors[i % colors.length]} />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export const LineChart = ({
  data,
  width = '100%',
  height = 300,
  className = '',
  categories = ['value'],
  index = 'name',
  colors = ['#8884d8'],
  valueFormatter = (value) => value.toString()
}: ChartProps) => {
  return (
    <ResponsiveContainer width={width} height={height} className={className}>
      <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={index} />
        <YAxis />
        <Tooltip formatter={valueFormatter} />
        <Legend />
        {categories.map((category, i) => (
          <Line 
            key={category} 
            type="monotone" 
            dataKey={category} 
            stroke={colors[i % colors.length]} 
            activeDot={{ r: 8 }} 
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export const PieChart = ({
  data,
  width = '100%',
  height = 300,
  className = '',
  category = 'value',
  index = 'name',
  colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF']
}: ChartProps) => {
  return (
    <ResponsiveContainer width={width} height={height} className={className}>
      <RechartsPieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey={category}
          nameKey={index}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, i) => (
            <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};
