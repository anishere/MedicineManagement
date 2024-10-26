/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// MedicineExpiryChart.js
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';

const COLORS = ['#FF8042', '#FFBB28', '#00C49F']; // Màu cho thuốc hết hạn, gần hết hạn và còn hạn
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const MedicineExpiryChart = ({ listMedicine }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const currentDate = dayjs();

    // Phân loại thuốc hết hạn, gần hết hạn và còn hạn
    const expiredCount = listMedicine.filter(medicine => dayjs(medicine.ngayHetHan).isBefore(currentDate)).length;
    const nearExpiryCount = listMedicine.filter(medicine => 
      dayjs(medicine.ngayHetHan).isAfter(currentDate) && 
      dayjs(medicine.ngayHetHan).diff(currentDate, 'month') < 1
    ).length;
    const validCount = listMedicine.length - expiredCount - nearExpiryCount;

    // Chuẩn bị dữ liệu cho biểu đồ
    const data = [
      { name: 'Thuốc hết hạn', value: expiredCount },
      { name: 'Thuốc gần hết hạn', value: nearExpiryCount },
      { name: 'Thuốc còn hạn', value: validCount },
    ];

    setChartData(data);
  }, [listMedicine]);

  return (
    <div className="text-center">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Phần chú thích */}
      <div className="legend mt-3">
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 15, height: 15, backgroundColor: COLORS[0], marginRight: 8 }}></div>
            <span>Thuốc hết hạn</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 15, height: 15, backgroundColor: COLORS[1], marginRight: 8 }}></div>
            <span>Thuốc gần hết hạn</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 15, height: 15, backgroundColor: COLORS[2], marginRight: 8 }}></div>
            <span>Thuốc còn hạn</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineExpiryChart;
