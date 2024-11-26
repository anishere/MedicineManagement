/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { axiosCus } from '../axios/axios'; // Giả sử bạn đã có axiosCus được định nghĩa
import { URLGetInvoice, URLListEmployee, URLListInvouces } from '../../URL/url';

const TopEmployeesChart = ({ data, employees }) => {
  // Tính tổng doanh thu của từng nhân viên
  const employeeRevenue = useMemo(() => {
    const revenueMap = {};

    // Tính doanh thu cho mỗi nhân viên từ các hóa đơn
    data.forEach(invoice => {
      const maNV = invoice.maNV;
      if (!revenueMap[maNV]) {
        revenueMap[maNV] = 0;
      }
      revenueMap[maNV] += invoice.tongGia; // Tổng doanh thu của nhân viên
    });

    // Tạo một mảng chứa thông tin nhân viên và doanh thu của họ
    const revenueArray = Object.keys(revenueMap).map(maNV => {
      const employee = employees.find(emp => emp.maNV === maNV);
      return {
        maNV,
        tenNV: employee ? employee.tenNV : "Không rõ",
        doanhThu: revenueMap[maNV],
      };
    });

    // Sắp xếp các nhân viên theo doanh thu giảm dần và lấy 5 nhân viên có doanh thu cao nhất
    return revenueArray
      .sort((a, b) => b.doanhThu - a.doanhThu)
      .slice(0, 5);
  }, [data, employees]);

  return (
    <div className="card p-3">
      <h4 className="text-center">Top 5 Nhân Viên Có Doanh Thu Cao Nhất</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={employeeRevenue}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="tenNV" />
          <YAxis />
          <Tooltip formatter={(value) => `${value.toLocaleString()} VND`} />
          <Legend />
          <Bar dataKey="doanhThu" fill="#0088FE" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const Dashboard = () => {
  const [dataHoaDon, setDataHoaDon] = useState([]);
  const [listNhanVien, setListNhanVien] = useState([]);

  // Fetch dữ liệu hóa đơn và nhân viên
  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseHoaDon = await axiosCus.get(URLListInvouces); // Thay URL phù hợp
        setDataHoaDon(responseHoaDon.listHoaDon);

        const responseNhanVien = await axiosCus.get(URLListEmployee); // Thay URL phù hợp
        setListNhanVien(responseNhanVien.listNhanVien);
        console.log(responseHoaDon)
        console.log(responseNhanVien)
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container mt-4">
      {/* Biểu đồ top 5 nhân viên có doanh thu cao nhất */}
      <TopEmployeesChart data={dataHoaDon} employees={listNhanVien} />
    </div>
  );
};

export default Dashboard;
