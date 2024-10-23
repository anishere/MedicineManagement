/* eslint-disable react-hooks/rules-of-hooks */
import { Button, Input, Space, Table } from "antd";
import { useEffect, useRef, useState } from "react";
import { axiosCus } from "../axios/axios";
import { URLDetailsInvoice, URLGetInvoice, URLListCustomer, URLListEmployee, URLListInvouces, URLListMedicine } from "../../URL/url";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";

function invoices() {
    const [listInvoices, setListInvoices] = useState([]);

    const [isUpdate, setIsUpdate] = useState(false)

    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    const [idSelected, setIdSelected] = useState('');

    const [invoiceData, setInvoiceData] = useState();
    const [invoiceDetails, setInvoiceDetails] = useState();
    const [listMedicine, setListMedicine] = useState();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosCus.get(URLListMedicine);
                setListMedicine(res.listMedicine);

                const [resInvoices, resCustomers, resEmployees] = await Promise.all([
                    axiosCus.get(URLListInvouces),
                    axiosCus.get(URLListCustomer),
                    axiosCus.get(URLListEmployee)
                ]);
    
                // Tạo từ điển để tìm tên và sdt khách hàng nhanh chóng
                const customerDict = {};
                resCustomers.listKhachHang.forEach(customer => {
                    customerDict[customer.maKH] = {
                        tenKH: customer.tenKH,
                        sdt: customer.sdt // Thêm sdt vào từ điển
                    };
                });
    
                const employeeDict = {};
                resEmployees.listNhanVien.forEach(employee => {
                    employeeDict[employee.maNV] = employee.tenNV;
                });
    
                // Map lại danh sách hóa đơn với tên, sdt khách hàng và tên nhân viên
                const updatedInvoices = resInvoices.listHoaDon.map(invoice => ({
                    ...invoice,
                    tenKH: customerDict[invoice.maKH]?.tenKH || 'Không rõ',
                    sdtKH: customerDict[invoice.maKH]?.sdt || 'Không rõ', // Thêm sdt khách hàng
                    tenNV: employeeDict[invoice.maNV] || 'Không rõ',
                }));
    
                setListInvoices(updatedInvoices);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [isUpdate]);      

    const getIDInvoice = (invoiceID) => {
        setIdSelected(invoiceID);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosCus.get(`${URLGetInvoice}${idSelected}`);
                setInvoiceData(res.listHoaDon[0]);
    
                const resDetailsInvoice = await axiosCus.get(`${URLDetailsInvoice}${idSelected}`);
                const invoiceDetails = resDetailsInvoice.listThuocTrongHD.map(detail => {
                    // Tìm tên thuốc và giá bán tương ứng với mã thuốc trong danh sách thuốc
                    const medicine = listMedicine.find(med => med.maThuoc === detail.maThuoc);
                    return {
                        ...detail,
                        tenThuoc: medicine ? medicine.tenThuoc : 'Không rõ',
                        giaBan: medicine ? medicine.giaBan : 0, // Lấy giá bán từ bảng thuốc
                        thanhTien: medicine ? detail.soLuongBan * medicine.giaBan : 0 // Tính thành tiền cho mỗi loại thuốc
                    };
                });
                setInvoiceDetails(invoiceDetails);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        if (idSelected) {
            fetchData();
        }
    }, [idSelected, listMedicine]);    
    
    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1677ff' : undefined,
                }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{
                        backgroundColor: '#ffc069',
                        padding: 0,
                    }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const columns = [
        {
            title: 'Mã hóa đơn',
            dataIndex: 'maHD',
            key: 'maHD',
            ...getColumnSearchProps('maHD'),
        },
        {
            title: 'Tên khách hàng',
            dataIndex: 'tenKH', // Thêm tên khách hàng
            key: 'tenKH',
            ...getColumnSearchProps('tenKH'),
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'sdtKH', // Thêm sdt khách hàng
            key: 'sdtKH',
            ...getColumnSearchProps('sdtKH'),
        },
        {
            title: 'Tên nhân viên',
            dataIndex: 'tenNV',
            key: 'tenNV',
            ...getColumnSearchProps('tenNV'),
        },
        {
            title: 'Ngày lập',
            dataIndex: 'ngayBan',
            key: 'ngayBan',
            ...getColumnSearchProps('ngayBan'),
        },
        {
            title: 'Tổng giá',
            dataIndex: 'tongGia',
            key: 'tongGia',
            ...getColumnSearchProps('tongGia'),
        }
    ];       

    return (
        <>
        <div className="wrap-invoices d-flex">
            <Table
                className="table-medicine table-invoices"
                columns={columns}
                dataSource={listInvoices}
                rowKey="maHD"  // Sửa lại rowKey thành maHD
                pagination={{ pageSize: 10 }} 
                onRow={(record) => ({
                    onClick: () => {
                        getIDInvoice(record.maHD); // Lấy ID hóa đơn khi nhấn vào dòng
                    },
                    onMouseEnter: (e) => {
                        e.currentTarget.style.cursor = 'pointer'; 
                    },
                })}
            />

            <div className="sec-infoMedicine sec-invoices">
                <h3 className="mb-3">THÔNG TIN HÓA ĐƠN</h3>
                {invoiceDetails && invoiceDetails.length > 0 ? (
                    <>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Tên thuốc</th>
                                <th>Số lượng</th>
                                <th>Đơn giá</th> {/* Display giaBan here */}
                                <th>Thành tiền</th> {/* Display thanhTien here */}
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceDetails.map((detail, index) => (
                                <tr key={index}>
                                    <td>{detail.tenThuoc}</td>
                                    <td>{detail.soLuongBan}</td> {/* Use soLuongBan for quantity */}
                                    <td>{detail.giaBan.toLocaleString()} VND</td> {/* Display giaBan */}
                                    <td>{detail.thanhTien.toLocaleString()} VND</td> {/* Display thanhTien */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <h5>Tổng tiền: {invoiceData.tongGia.toLocaleString()} VND</h5>
                    </>
                ) : (
                    <p>Không có thông tin chi tiết.</p>
                )}
            </div>
        </div>
    </>
    );
}

export default invoices;