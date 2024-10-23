/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { axiosCus } from "../axios/axios";
import { URLEmployeID, URLListCustomer, URLListMedicine, URLCreateInvoice, URLAddMedicineToInvoice, URLGetCusByID, ChiNhanh } from "../../URL/url";
import { Modal, Button, Table } from "antd";
import MedicineTable from "../components/tableMediforSell";
import CustomerTable from "../components/tableCusforSell";
import { Bounce, toast } from "react-toastify";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

function SellMedicine() {
    const [listMedicine, setListMedicine] = useState([]);
    const [listCustomer, setListCustomer] = useState([]);
    const [medicineSelected, setMedicineSelected] = useState({
        id: '', 
        quantity: 0,
        name: '',
        price: 0,
    });
    const [idCustomer, setIdCustomer] = useState();
    const [customerSelected, setCustomerSelected] = useState({
        maKH: 'KH999',
        tenKH: 'Vãng lai',
        sdt: '9999',
        gt: '000',
        maCN: 'CN001',
    });
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosCus.get(URLListMedicine);
                setListMedicine(res.listMedicine);

                const rescus = await axiosCus.get(URLListCustomer);
                setListCustomer(rescus.listKhachHang);

                if (idCustomer) {
                    const resCusSelected = await axiosCus.get(`${URLGetCusByID}${idCustomer}`);
                    setCustomerSelected(resCusSelected.listKhachHang[0]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [idCustomer]);

    const getCusbyID = (CusID) => {
        setIdCustomer(CusID);
    };

    const getIDMedicine = (medicineID, nameMedicine, priceMedicine) => {
        showModal();
        setMedicineSelected({ id: medicineID, quantity: 0, name: nameMedicine, price: priceMedicine });
    };

    const addMedicineToInvoice = () => {
        if (medicineSelected.id && medicineSelected.quantity > 0) {
            const newItem = {
                id: medicineSelected.id,
                name: medicineSelected.name,
                quantity: medicineSelected.quantity,
                price: medicineSelected.price,
                totalPrice: medicineSelected.quantity * medicineSelected.price
            };
            setInvoiceItems([...invoiceItems, newItem]);
            handleCancel();
        }
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        addMedicineToInvoice();
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const confirmInvoice = async () => {
        if (!customerSelected || invoiceItems.length === 0) {
            alert('Vui lòng chọn khách hàng và thêm ít nhất một thuốc.');
            return;
        }
        
        const employeeID = localStorage.getItem('maNV');

        try {
            const invoiceRes = await axiosCus.post(URLCreateInvoice, {
                maNV: employeeID,
                maKH: customerSelected.maKH,
                ngayBan: new Date().toISOString(),
                maCN: ChiNhanh,
                tongGia: invoiceItems.reduce((acc, item) => acc + item.totalPrice, 0)
            });
            
            const maHD = invoiceRes.maHD;
            
            for (const item of invoiceItems) {
                await axiosCus.post(URLAddMedicineToInvoice, {
                    MaHD: maHD,
                    MaThuoc: item.id,
                    SoLuongBan: item.quantity,
                    MaCN: ChiNhanh
                });
            }

            toast.success('Hóa đơn đã được tạo thành công', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
                });
            setInvoiceItems([]);
        } catch (error) {
            console.error('Error creating invoice:', error);
            alert('Lỗi khi tạo hóa đơn. Vui lòng thử lại.');
        }
    };

    const removeItemFromInvoice = (id) => {
        setInvoiceItems(invoiceItems.filter(item => item.id !== id));
    };

    const columns = [
        {
            title: 'Tên thuốc',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            render: (text) => `${text.toLocaleString()} VND`
        },
        {
            title: 'Số Lượng',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Thành tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (text) => `${text.toLocaleString()} VND`
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (text, record) => (
                <Button type="link" onClick={() => removeItemFromInvoice(record.id)}>
                    Xóa
                </Button>
            ),
        },
    ];

    const totalAmount = invoiceItems.reduce((acc, item) => acc + item.totalPrice, 0);

    // Import phông chữ mặc định
    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    const generatePDF = () => {
        const docDefinition = {
            content: [
                {
                    text: 'HÓA ĐƠN BÁN THUỐC',
                    fontSize: 16,
                    bold: true,
                    alignment: 'center',  // Center the title
                    margin: [0, 0, 0, 20]  // Add some margin below the title
                },
                {
                    text: `Khách hàng: ${customerSelected.tenKH}`,
                    margin: [0, 0, 0, 10],
                },
                {
                    text: `Số điện thoại: ${customerSelected.sdt}`,
                    margin: [0, 0, 0, 10],
                },
                {
                    text: `Ngày lập: ${new Date().toLocaleDateString()}`,  // Include both date and time
                    margin: [0, 0, 0, 10],
                },
                {
                    text: `Giờ lập hóa đơn: ${new Date().toLocaleTimeString()}`,  // Include both date and time
                    margin: [0, 0, 0, 20],
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: [
                            ['Tên thuốc', 'Đơn giá', 'Số lượng', 'Thành tiền'],
                            ...invoiceItems.map(item => [item.name, `${item.price.toLocaleString()} VND`, item.quantity, `${item.totalPrice.toLocaleString()} VND`])
                        ]
                    }
                },
                {
                    text: `Tổng giá: ${totalAmount.toLocaleString()} VND`,
                    bold: true,
                    alignment: 'right',
                    margin: [0, 20, 0, 0]
                }
            ]
        };
    
        pdfMake.createPdf(docDefinition).download(`hoa_don_${new Date().getTime()}.pdf`);
    };    

    return (
        <div className="wrap-sell">
            <div className="sellMedicine d-flex justify-content-between">
                <div className="section w-100 me-2 p-2">
                    <h5>Danh sách thuốc</h5>
                    <MedicineTable listMedicine={listMedicine} getIDMedicine={getIDMedicine} />
                    <h5>Danh sách khách hàng</h5>
                    <CustomerTable listCustomer={listCustomer} getCusbyID={getCusbyID} />
                </div>
                <div className="section w-100 me-2 p-2">
                    <h5>Chi tiết Hóa đơn</h5>
                    <p>Khách hàng: <b>{customerSelected && customerSelected.tenKH}</b></p>
                    <Table
                        dataSource={invoiceItems}
                        columns={columns}
                        rowKey="id"
                        pagination={false}
                    />
                    <p style={{ marginTop: '10px', fontWeight: 'bold' }}>
                        Tổng giá: {totalAmount.toLocaleString()} VND
                    </p>
                    <Button type="primary" onClick={confirmInvoice} style={{ marginTop: '10px' }}>
                        Xác nhận hóa đơn
                    </Button>
                    <Button type="default" onClick={generatePDF} style={{ marginTop: '10px', marginLeft: '10px' }}>
                        In hóa đơn
                    </Button>
                </div>
            </div>

            {/* Modal */}
            <Modal title="Nhập số lượng" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <p>
                    <label htmlFor="">Nhập số lượng: </label>
                    <input
                        value={medicineSelected.quantity}
                        onChange={(e) =>
                            setMedicineSelected({ ...medicineSelected, quantity: parseInt(e.target.value) || 0 })
                        }
                        type="number"
                    />
                </p>
            </Modal>
        </div>
    );
}

export default SellMedicine;
