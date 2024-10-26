/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// ImportByMonthChart.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ImportByMonthChart = ({ data }) => {
  return (
    <div className="card p-3">
      <h4 className="text-center">Tiền nhập theo tháng</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis
            tickFormatter={(value) => value.toLocaleString()} // Định dạng giá trị trên trục Y
          />
          <Tooltip
            formatter={(value) => value.toLocaleString()} // Định dạng giá trị trên tooltip
            labelFormatter={(label) => `${label}`}
          />
          <Legend />
          <Bar dataKey="total" fill="#8884d8" name="Tiền nhập (VND)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ImportByMonthChart;
