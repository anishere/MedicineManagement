/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const ProfitByMonthChart = ({ data }) => {
  return (
    <div className="card p-3">
      <h4 className="text-center">Lợi nhuận theo tháng</h4>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => value.toLocaleString()} />
          <Tooltip formatter={(value) => value.toLocaleString()} />
          <Legend />
          <Bar dataKey="profit" barSize={20} fill="#413ea0" name="Lợi nhuận (VND)" />
          <Line type="monotone" dataKey="revenue" stroke="#ff7300" name="Doanh thu (VND)" />
          <Line type="monotone" dataKey="importCost" stroke="#8884d8" name="Tiền nhập (VND)" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProfitByMonthChart;
