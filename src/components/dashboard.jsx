/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { axiosCus } from '../axios/axios';
import { URLListInvouces } from '../../URL/url';
import dayjs from 'dayjs';

const Dashboard = () => {
  const [data, setData] = useState([]); // Khởi tạo state để lưu dữ liệu hóa đơn
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const res = await axiosCus.get(URLListInvouces);

        // Kiểm tra xem dữ liệu có tồn tại hay không
        if (res && res.listHoaDon && res.listHoaDon.length > 0) {
          const invoices = res.listHoaDon;

          // Tạo một đối tượng để lưu tổng doanh thu theo từng ngày
          const revenueByDate = {};

          // Duyệt qua các hóa đơn, lấy ngày bán và tổng giá, gộp các ngày trùng
          invoices.forEach(invoice => {
            const date = dayjs(invoice.ngayBan).format('YYYY-MM-DD'); // Lấy ngày bán theo định dạng YYYY-MM-DD
            const total = invoice.tongGia; // Lấy tổng giá trị của hóa đơn

            // Nếu ngày đã tồn tại trong revenueByDate, cộng dồn tổng giá
            if (revenueByDate[date]) {
              revenueByDate[date] += total;
            } else {
              revenueByDate[date] = total; // Nếu chưa tồn tại, khởi tạo với tổng giá trị ban đầu
            }
          });

          // Chuyển đổi đối tượng thành mảng để truyền vào biểu đồ
          const chartData = Object.keys(revenueByDate).map(date => ({
            name: date,
            total: revenueByDate[date],
          }));

          setData(chartData); // Lưu dữ liệu đã xử lý vào state
        } else {
          throw new Error('Không có dữ liệu hóa đơn');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, []);

  if (loading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div>Có lỗi xảy ra: {error}</div>;
  }

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <BarChart
          data={data} // Truyền dữ liệu vào biểu đồ
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
          {/* Hiển thị cột doanh thu */}
          <Bar dataKey="total" fill="#8884d8" name="Doanh thu (VND)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Dashboard;
