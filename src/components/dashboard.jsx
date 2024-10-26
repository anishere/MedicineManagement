/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { axiosCus } from '../axios/axios';
import { ChiNhanh, URLGetInvoiceFromServer, URLListCungCap, URLListInvouces, URLListMedicine } from '../../URL/url';
import dayjs from 'dayjs';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import các component biểu đồ
import RevenueByDateChart from './revenueByDateChart';
import RevenueByMonthChart from './revenueByMonthChart';
import RevenuePieChart from './revenuePieChart';
import MedicineExpiryChart from './medicineExpiryChart';
import ImportByMonthChart from './importByMonthChart';

const Dashboard = () => {
  // State chung
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho biểu đồ doanh thu theo ngày
  const [revenueDataByDate, setRevenueDataByDate] = useState([]);
  const [selectedRevenueYear, setSelectedRevenueYear] = useState(dayjs().year());
  const [selectedRevenueMonth, setSelectedRevenueMonth] = useState(dayjs().month() + 1);
  const [availableRevenueYears, setAvailableRevenueYears] = useState([]);
  const [availableRevenueMonths, setAvailableRevenueMonths] = useState([]);

  // State cho biểu đồ doanh thu theo tháng
  const [dataByMonth, setDataByMonth] = useState([]);
  const [selectedMonthYear, setSelectedMonthYear] = useState(dayjs().year());
  const [availableMonthYears, setAvailableMonthYears] = useState([]);

  // State cho biểu đồ tiền nhập theo tháng
  const [importDataByMonth, setImportDataByMonth] = useState([]);
  const [selectedImportYear, setSelectedImportYear] = useState(dayjs().year());
  const [availableImportYears, setAvailableImportYears] = useState([]);

  // State cho biểu đồ tỉ lệ doanh thu
  const [revenueData, setRevenueData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // State cho biểu đồ thuốc hết hạn
  const [listMedicine, setListMedicine] = useState([]);

  useEffect(() => {
    // Hàm fetch dữ liệu cho biểu đồ doanh thu theo ngày
    const fetchRevenueData = async () => {
      try {
        const res = await axiosCus.get(URLListInvouces);
        if (res && res.listHoaDon && res.listHoaDon.length > 0) {
          const invoices = res.listHoaDon;
          const revenueByDate = {};
          const revenueYears = new Set();
          const revenueMonths = new Set();

          invoices.forEach(invoice => {
            const date = dayjs(invoice.ngayBan).format('YYYY-MM-DD');
            const month = dayjs(invoice.ngayBan).month() + 1;
            const year = dayjs(invoice.ngayBan).year();
            const total = invoice.tongGia;

            revenueYears.add(year);
            if (year === selectedRevenueYear) {
              revenueMonths.add(month);
              if (month === selectedRevenueMonth) {
                revenueByDate[date] = (revenueByDate[date] || 0) + total;
              }
            }
          });

          const chartDataByDate = Object.keys(revenueByDate)
            .map(date => ({
              name: date,
              total: revenueByDate[date],
            }))
            .sort((a, b) => new Date(a.name) - new Date(b.name));

          setRevenueDataByDate(chartDataByDate);
          setAvailableRevenueYears(Array.from(revenueYears).sort((a, b) => a - b));
          setAvailableRevenueMonths(Array.from(revenueMonths).sort((a, b) => a - b));
        } else {
          throw new Error('Không có dữ liệu hóa đơn');
        }
      } catch (error) {
        console.error("Error fetching revenue data:", error.message);
      }
    };

    // Hàm fetch dữ liệu cho biểu đồ doanh thu theo tháng
    const fetchMonthlyRevenueData = async () => {
      try {
        const res = await axiosCus.get(URLListInvouces);
        if (res && res.listHoaDon && res.listHoaDon.length > 0) {
          const invoices = res.listHoaDon;
          const revenueByMonth = {};
          const monthYears = new Set();

          invoices.forEach(invoice => {
            const month = dayjs(invoice.ngayBan).month() + 1;
            const year = dayjs(invoice.ngayBan).year();
            const total = invoice.tongGia;

            monthYears.add(year);
            if (year === selectedMonthYear) {
              revenueByMonth[month] = (revenueByMonth[month] || 0) + total;
            }
          });

          const chartDataByMonth = Object.keys(revenueByMonth)
            .map(month => ({
              name: `Tháng ${month}`,
              total: revenueByMonth[month],
            }))
            .sort((a, b) => parseInt(a.name.split(" ")[1]) - parseInt(b.name.split(" ")[1]));

          setDataByMonth(chartDataByMonth);
          setAvailableMonthYears(Array.from(monthYears).sort((a, b) => a - b));
        } else {
          throw new Error('Không có dữ liệu hóa đơn');
        }
      } catch (error) {
        setError(error.message);
      }
    };

    // Hàm fetch dữ liệu cho biểu đồ tiền nhập theo tháng
    const fetchImportData = async () => {
      try {
        const response = await axiosCus.get(URLListCungCap);
        const cungCapData = response.listCungCap;
        const importByMonth = {};
        const importYears = new Set();

        cungCapData.forEach(item => {
          const month = dayjs(item.ngayCungCap).month() + 1;
          const year = dayjs(item.ngayCungCap).year();
          const giaNhap = item.giaNhap || 0;

          importYears.add(year);
          if (year === selectedImportYear) {
            importByMonth[month] = (importByMonth[month] || 0) + giaNhap * item.soLuongThuocNhap;
          }
        });

        const chartDataByMonth = Object.keys(importByMonth)
          .map(month => ({
            name: `Tháng ${month}`,
            total: importByMonth[month],
          }))
          .sort((a, b) => parseInt(a.name.split(" ")[1]) - parseInt(b.name.split(" ")[1]));

        setImportDataByMonth(chartDataByMonth);
        setAvailableImportYears(Array.from(importYears).sort((a, b) => a - b));
      } catch (error) {
        console.error("Error fetching import data:", error.message);
      }
    };

    // Hàm fetch dữ liệu cho biểu đồ tỉ lệ doanh thu
    const fetchRevenueStatistics = async () => {
      try {
        const response = await axiosCus.get(`${URLGetInvoiceFromServer}${ChiNhanh}`);
        const data = response;
        
        const revenueInfo = [
          { name: 'Doanh thu chi nhánh', value: data.branchRevenue, percentage: data.branchPercentage.toFixed(2) },
          { name: 'Các chi nhánh khác', value: data.totalRevenue - data.branchRevenue, percentage: (100 - data.branchPercentage).toFixed(2) },
        ];

        setRevenueData(revenueInfo);
        setTotalRevenue(data.totalRevenue);
      } catch (error) {
        console.error("Error fetching revenue statistics:", error);
      }
    };

    // Hàm fetch dữ liệu thuốc
    const fetchMedicineData = async () => {
      try {
        const response = await axiosCus.get(URLListMedicine);
        setListMedicine(response.listMedicine);
      } catch (error) {
        console.error("Error fetching medicine data:", error);
      }
    };

    fetchRevenueData();
    fetchMonthlyRevenueData();
    fetchImportData();
    fetchRevenueStatistics();
    fetchMedicineData();
  }, [selectedRevenueYear, selectedRevenueMonth, selectedMonthYear, selectedImportYear]);

  return (
    <div className="container mt-4">
      {/* Biểu đồ doanh thu theo ngày */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Doanh thu theo ngày</h3>
        <div className="d-flex align-items-center">
          <label htmlFor="revenueYearSelect" className="me-2">Chọn năm:</label>
          <select
            id="revenueYearSelect"
            value={selectedRevenueYear}
            onChange={(e) => setSelectedRevenueYear(parseInt(e.target.value))}
            className="form-select me-2"
            style={{ width: '100px' }}
          >
            {availableRevenueYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <label htmlFor="revenueMonthSelect" className="me-2">Chọn tháng:</label>
          <select
            id="revenueMonthSelect"
            value={selectedRevenueMonth}
            onChange={(e) => setSelectedRevenueMonth(parseInt(e.target.value))}
            className="form-select"
            style={{ width: '116px' }}
          >
            {availableRevenueMonths.map(month => (
              <option key={month} value={month}>{`Tháng ${month}`}</option>
            ))}
          </select>
        </div>
      </div>
      <RevenueByDateChart data={revenueDataByDate} />

      {/* Biểu đồ doanh thu theo tháng */}
      <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
        <h3 className="mb-0">Doanh thu theo tháng</h3>
        <div className="d-flex align-items-center">
          <label htmlFor="monthYearSelect" className="me-2">Chọn năm:</label>
          <select
            id="monthYearSelect"
            value={selectedMonthYear}
            onChange={(e) => setSelectedMonthYear(parseInt(e.target.value))}
            className="form-select"
            style={{ width: '100px' }}
          >
            {availableMonthYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
      <RevenueByMonthChart data={dataByMonth} />

      <div className='row'>
        <div className='col-md-6 '>
          {/* Biểu đồ tỉ lệ doanh thu của chi nhánh */}
          <h3 className="mt-md-4">Tỉ lệ doanh thu của chi nhánh</h3>
          <RevenuePieChart data={revenueData} />
          <div className="text-center mt-3">
            <h5>Tổng doanh thu: {totalRevenue.toLocaleString()} VND</h5>
          </div>
        </div>

        <div className='col-md-6 '>
          {/* Biểu đồ thuốc hết hạn */}
          <h3 className="mt-4">Thuốc hết hạn và còn hạn</h3>
          <MedicineExpiryChart listMedicine={listMedicine} />
        </div>
      </div>

      {/* Biểu đồ tiền nhập theo tháng */}
      <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
        <h3 className="mb-0">Tiền nhập theo tháng</h3>
        <div className="d-flex align-items-center">
          <label htmlFor="importYearSelect" className="me-2">Chọn năm:</label>
          <select
            id="importYearSelect"
            value={selectedImportYear}
            onChange={(e) => setSelectedImportYear(parseInt(e.target.value))}
            className="form-select"
            style={{ width: '100px' }}
          >
            {availableImportYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
      <ImportByMonthChart data={importDataByMonth} />
    </div>
  );
};

export default Dashboard;
