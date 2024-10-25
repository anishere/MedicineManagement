/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { axiosCus } from '../axios/axios';
import { ChiNhanh, URLGetInvoiceFromServer, URLListInvouces } from '../../URL/url';
import dayjs from 'dayjs';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import các component biểu đồ
import RevenueByDateChart from './RevenueByDateChart';
import RevenueByMonthChart from './RevenueByMonthChart';
import RevenuePieChart from './RevenuePieChart';

const Dashboard = () => {
  const [dataByDate, setDataByDate] = useState([]);
  const [dataByMonth, setDataByMonth] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0); // Thêm biến tổng doanh thu
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const res = await axiosCus.get(URLListInvouces);

        if (res && res.listHoaDon && res.listHoaDon.length > 0) {
          const invoices = res.listHoaDon;
          const revenueByDate = {};
          const revenueByMonth = {};
          const yearsSet = new Set();

          invoices.forEach(invoice => {
            const date = dayjs(invoice.ngayBan).format('YYYY-MM-DD');
            const month = dayjs(invoice.ngayBan).month() + 1;
            const year = dayjs(invoice.ngayBan).year();
            const total = invoice.tongGia;

            yearsSet.add(year);

            if (revenueByDate[date]) {
              revenueByDate[date] += total;
            } else {
              revenueByDate[date] = total;
            }

            if (year === selectedYear) {
              if (revenueByMonth[month]) {
                revenueByMonth[month] += total;
              } else {
                revenueByMonth[month] = total;
              }
            }
          });

          const chartDataByDate = Object.keys(revenueByDate)
            .map(date => ({
              name: date,
              total: revenueByDate[date],
            }))
            .sort((a, b) => new Date(a.name) - new Date(b.name));

          const chartDataByMonth = Object.keys(revenueByMonth)
            .map(month => ({
              name: `Tháng ${month}`,
              total: revenueByMonth[month],
            }))
            .sort((a, b) => parseInt(a.name.split(" ")[1]) - parseInt(b.name.split(" ")[1]));

          setDataByDate(chartDataByDate);
          setDataByMonth(chartDataByMonth);
          setAvailableYears(Array.from(yearsSet).sort((a, b) => a - b));
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

    // Gọi API để lấy dữ liệu doanh thu tổng và doanh thu chi nhánh hiện tại
    const fetchRevenueStatistics = async () => {
      try {
        const response = await axiosCus.get(`${URLGetInvoiceFromServer}${ChiNhanh}`);
        const data = response;

        const revenueInfo = [
          { name: 'Doanh thu chi nhánh', value: data.branchRevenue, percentage: data.branchPercentage.toFixed(2) },
          { name: 'Các chi nhánh khác', value: data.totalRevenue - data.branchRevenue, percentage: (100 - data.branchPercentage).toFixed(2) },
        ];

        setRevenueData(revenueInfo);
        setTotalRevenue(data.totalRevenue); // Lưu tổng doanh thu để hiển thị dưới biểu đồ
      } catch (error) {
        console.error("Error fetching revenue statistics:", error);
      }
    };

    fetchRevenueStatistics();
  }, [selectedYear]);

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value));
  };

  if (loading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div>Có lỗi xảy ra: {error}</div>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Doanh thu theo tháng</h3>
        <div className="d-flex align-items-center">
          <label htmlFor="yearSelect" className="me-2">Chọn năm:</label>
          <select
            id="yearSelect"
            value={selectedYear}
            onChange={handleYearChange}
            className="form-select"
            style={{ width: '100px' }}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <RevenueByDateChart data={dataByDate} />
        </div>
        <div className="col-md-6">
          <RevenueByMonthChart data={dataByMonth} />
        </div>
        
        <div className="col-md-6 mt-4">
          <RevenuePieChart data={revenueData} />
          <div className="text-center mt-3">
            <h5>Tổng doanh thu: {totalRevenue.toLocaleString()} VND</h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
