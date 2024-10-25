/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// RevenueByDateChart.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RevenueByDateChart = ({ data }) => {
  return (
    <div className="card p-3">
      <h4 className="text-center">Doanh thu theo ngày</h4>
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
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" fill="#8884d8" name="Doanh thu (VND)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueByDateChart;
