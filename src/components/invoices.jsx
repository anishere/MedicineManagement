/* eslint-disable react-hooks/rules-of-hooks */
import { Button, Input, Modal, Space, Table } from "antd";
import { useEffect, useRef, useState } from "react";
import { axiosCus } from "../axios/axios";
import { URLDeleDetailByIDInvoice, URLDeleteInvoice, URLDetailsInvoice, URLGetInvoice, URLListCustomer, URLListEmployee, URLListInvouces, URLListMedicine } from "../../URL/url";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

function invoices() {
    const [listInvoices, setListInvoices] = useState([]);
    const [isUpdate, setIsUpdate] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const [idSelected, setIdSelected] = useState('');
    
    const [invoiceData, setInvoiceData] = useState();
    const [invoiceDetails, setInvoiceDetails] = useState();
    const [listMedicine, setListMedicine] = useState();

    // State lưu thông tin khách hàng
    const [customerInfo, setCustomerInfo] = useState({ tenKH: '', sdtKH: '' });

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

        // Lưu thông tin khách hàng tương ứng với mã hóa đơn
        const selectedInvoice = listInvoices.find(invoice => invoice.maHD === invoiceID);
        if (selectedInvoice) {
            setCustomerInfo({
                tenKH: selectedInvoice.tenKH,
                sdtKH: selectedInvoice.sdtKH
            });
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosCus.get(`${URLGetInvoice}${idSelected}`);
                const selectedInvoice = res.listHoaDon[0];
                setInvoiceData(selectedInvoice);
    
                // Tìm tên nhân viên từ listInvoices
                const selectedInvoiceFromList = listInvoices.find(invoice => invoice.maHD === selectedInvoice.maHD);
                const employeeName = selectedInvoiceFromList ? selectedInvoiceFromList.tenNV : 'Không rõ';
                selectedInvoice.tenNV = employeeName;  // Gắn tên nhân viên vào invoiceData
    
                const resDetailsInvoice = await axiosCus.get(`${URLDetailsInvoice}${idSelected}`);
                const invoiceDetails = resDetailsInvoice.listThuocTrongHD.map(detail => {
                    const medicine = listMedicine.find(med => med.maThuoc === detail.maThuoc);
                    return {
                        ...detail,
                        tenThuoc: medicine ? medicine.tenThuoc : 'Không rõ',
                        giaBan: medicine ? medicine.giaBan : 0,
                        thanhTien: medicine ? detail.soLuongBan * medicine.giaBan : 0
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
    }, [idSelected, listMedicine, listInvoices]);    
    
    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
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

    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    const generatePDF = () => {
        if (!invoiceData || !invoiceDetails) {
            alert('Không có hóa đơn để in.');
            return;
        }
    
        const docDefinition = {
            content: [
                {
                    text: 'HÓA ĐƠN BÁN THUỐC',
                    fontSize: 16,
                    bold: true,
                    alignment: 'center',  // Canh giữa tiêu đề
                    margin: [0, 0, 0, 20],  // Thêm margin phía dưới tiêu đề
                },
                {
                    text: `Khách hàng: ${customerInfo.tenKH}`,  // Sử dụng thông tin khách hàng đã lưu
                    margin: [0, 0, 0, 10],
                },
                {
                    text: `Số điện thoại: ${customerInfo.sdtKH}`,  // Sử dụng số điện thoại đã lưu
                    margin: [0, 0, 0, 10],
                },
                {
                    text: `Ngày lập: ${new Date(invoiceData.ngayBan).toLocaleDateString()}`,
                    margin: [0, 0, 0, 10],
                },
                {
                    text: `Nhân viên thực hiện: ${invoiceData.tenNV || 'Không rõ'}`,
                    margin: [0, 0, 0, 20],
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: [
                            ['Tên thuốc', 'Số lượng', 'Đơn giá', 'Thành tiền'],
                            ...invoiceDetails.map(detail => [
                                detail.tenThuoc, 
                                detail.soLuongBan, 
                                `${detail.giaBan.toLocaleString()} VND`, 
                                `${detail.thanhTien.toLocaleString()} VND`
                            ])
                        ],
                    },
                    margin: [0, 20, 0, 0],
                },
                {
                    text: `Tổng giá: ${invoiceData.tongGia.toLocaleString()} VND`,
                    bold: true,
                    alignment: 'right',
                    margin: [0, 20, 0, 0]
                }
            ],
        };
    
        pdfMake.createPdf(docDefinition).download(`hoa_don_${new Date().getTime()}.pdf`);
    };

    const handleDeleteInvoice = () => {
        // Hiển thị hộp thoại xác nhận trước khi xóa
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa tất cả các thuốc trong hóa đơn này?',
            okText: 'Xác nhận',
            cancelText: 'Hủy bỏ',
            onOk: () => {
                // Nếu người dùng nhấn OK, thực hiện xóa
                const fetchData = async () => {
                    try {
                        // Xóa chi tiết hóa đơn (thuốc trong hóa đơn)
                        const res = await axiosCus.delete(`${URLDeleDetailByIDInvoice}${idSelected}`);
                        // Xóa hóa đơn
                        const res2 = await axiosCus.delete(`${URLDeleteInvoice}${idSelected}`);
                        console.log(res);
                        console.log(res2);
                        setIsUpdate(!isUpdate);
                        setInvoiceData(null);
                        setInvoiceDetails(null);
                    } catch (error) {
                        console.error('Error fetching data:', error);
                    }
                };
                fetchData();
            },
            onCancel() {
                console.log('Hủy xóa hóa đơn');
            }
        });
    };
    
    return (
        <>
        <div className="wrap-invoices d-flex">
            <Table
                className="table-medicine table-invoices"
                columns={columns}
                dataSource={listInvoices}
                rowKey="maHD"
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
                {invoiceData && (
                    <>
                        <p><strong>Khách hàng:</strong> {customerInfo.tenKH}</p>
                        <p><strong>Số điện thoại:</strong> {customerInfo.sdtKH}</p>
                        <p><strong>Nhân viên thực hiện:</strong> {invoiceData.tenNV}</p>
                        {invoiceDetails && invoiceDetails.length > 0 ? (
                            <>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Tên thuốc</th>
                                            <th>Số lượng</th>
                                            <th>Đơn giá</th>
                                            <th>Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoiceDetails.map((detail, index) => (
                                            <tr key={index}>
                                                <td>{detail.tenThuoc}</td>
                                                <td>{detail.soLuongBan}</td>
                                                <td>{detail.giaBan.toLocaleString()} VND</td>
                                                <td>{detail.thanhTien.toLocaleString()} VND</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <h5>Tổng tiền: {invoiceData.tongGia.toLocaleString()} VND</h5>
                            </>
                        ) : (
                            <p className="text-center">Chọn 1 hóa đơn để xem thông tin chi tiết.</p>
                        )}
                        <Button onClick={generatePDF} type="primary" style={{ marginTop: '20px' }}>
                            In Hóa Đơn
                        </Button>
                        <Button onClick={handleDeleteInvoice} type="primary" style={{ marginTop: '20px' }}>
                            Xóa Hóa Đơn
                        </Button>
                    </>
                )}
            </div>
        </div>
    </>
    );
}

export default invoices;
