/* eslint-disable no-unused-vars */
// Trong SellMedicine.jsx

import React, { useEffect, useState } from "react";
import { axiosCus } from "../axios/axios";
import { URLEmployeID, URLListCustomer, URLListMedicine, URLCreateInvoice, URLAddMedicineToInvoice, URLGetCusByID, ChiNhanh, URLUpdateMedicine } from "../../URL/url";
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
        stock: 0, // Số lượng hiện có từ backend
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

    const [isUpdate, setIsUpdate] = useState(false);

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
    }, [idCustomer , isUpdate]);

    const getCusbyID = (CusID) => setIdCustomer(CusID);

    const getIDMedicine = (medicineID, nameMedicine, priceMedicine, stock) => {
        showModal();
        setMedicineSelected({ id: medicineID, quantity: 0, name: nameMedicine, price: priceMedicine, stock });
    };

    const addMedicineToInvoice = () => {
        if (medicineSelected.quantity > medicineSelected.stock) {
            toast.error('Số lượng thuốc vượt quá số lượng hiện có trong kho!', {
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
            return;
        }

        if (medicineSelected.id && medicineSelected.quantity > 0) {
            const newItem = {
                id: medicineSelected.id,
                name: medicineSelected.name,
                quantity: medicineSelected.quantity,
                price: medicineSelected.price,
                totalPrice: medicineSelected.quantity * medicineSelected.price,
                stock: medicineSelected.stock,
            };
            setInvoiceItems([...invoiceItems, newItem]);
            handleCancel();
        }
    };

    const showModal = () => setIsModalOpen(true);
    const handleOk = () => addMedicineToInvoice();
    const handleCancel = () => setIsModalOpen(false);

    const confirmInvoice = async () => {
        if (!customerSelected || invoiceItems.length === 0) {
            Modal.warning({
                title: 'Thông báo',
                content: 'Vui lòng chọn khách hàng và thêm ít nhất một thuốc.',
                okText: 'Đóng',
            });
            return;
        }
    
        const employeeID = localStorage.getItem('maNV');
    
        try {
            Modal.confirm({
                title: 'Xác nhận hành động',
                content: 'Bạn muốn thực hiện hành động gì cho hóa đơn này?',
                footer: (
                    <div style={{ textAlign: "center" }}>
                        <Button onClick={async () => {
                            try {
                                await handleInvoiceSave(employeeID); // Lưu hóa đơn nếu chỉ xác nhận
                                toast.success('Hóa đơn đã được tạo thành công mà không in');
                                Modal.destroyAll(); // Đóng modal
                            } catch (error) {
                                console.error('Error saving invoice:', error);
                                toast.error('Có lỗi xảy ra khi lưu hóa đơn.'); // Thông báo lỗi
                            }
                        }}>
                            Chỉ xác nhận
                        </Button>
                        <Button className="mx-2" onClick={async () => {
                            try {
                                generatePDF(employeeID); // Tạo và tải PDF trước
                                await handleInvoiceSave(employeeID); // Lưu hóa đơn sau khi in PDF
                                Modal.destroyAll();
                            } catch (error) {
                                console.error('Error printing or saving invoice:', error);
                                toast.error('Có lỗi xảy ra khi in hoặc lưu hóa đơn.');
                            }
                        }}>
                            Xác nhận và in
                        </Button>
                        <Button onClick={() => {
                            toast.info('Bạn đã hủy hành động.');
                            Modal.destroyAll(); // Đóng modal khi chọn hủy
                        }}>
                            Hủy
                        </Button>
                    </div>
                ),
                onCancel() { Modal.destroyAll(); }
            });
        } catch (error) {
            console.error('Error during confirmation:', error);
            toast.error('Lỗi khi xác nhận hóa đơn');
        }
    };        

    const handleInvoiceSave = async (employeeID) => {
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
                const addMedicineRes = await axiosCus.post(URLAddMedicineToInvoice, {
                    MaHD: maHD,
                    MaThuoc: item.id,
                    SoLuongBan: item.quantity,
                    MaCN: ChiNhanh
                });
    
                const medicineInfo = listMedicine.find(med => med.maThuoc === item.id);
                if (!medicineInfo) {
                    console.error(`Không tìm thấy thuốc với mã ${item.id}`);
                    continue;
                }
    
                const updatedStock = item.stock - item.quantity;
    
                const updatedMedicineData = {
                    ...medicineInfo,
                    soLuongThuocCon: updatedStock
                };
    
                const updateStockRes = await axiosCus.put(`${URLUpdateMedicine}${item.id}`, updatedMedicineData);
                setIsUpdate(!isUpdate);
            }
    
            setInvoiceItems([]);
        } catch (error) {
            console.error('Error creating invoice:', error);
            throw error;
        }
    };       

    const removeItemFromInvoice = (id) => {
        setInvoiceItems(invoiceItems.filter(item => item.id !== id));
    };

    const columns = [
        { title: 'Tên thuốc', dataIndex: 'name', key: 'name' },
        { title: 'Đơn giá', dataIndex: 'price', key: 'price', render: (text) => `${text.toLocaleString()} VND` },
        { title: 'Số Lượng', dataIndex: 'quantity', key: 'quantity' },
        { title: 'Thành tiền', dataIndex: 'totalPrice', key: 'totalPrice', render: (text) => `${text.toLocaleString()} VND` },
        {
            title: 'Hành động', key: 'action',
            render: (text, record) => (
                <Button type="link" onClick={() => removeItemFromInvoice(record.id)}>
                    Xóa
                </Button>
            ),
        },
    ];

    const totalAmount = invoiceItems.reduce((acc, item) => acc + item.totalPrice, 0);

    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    const generatePDF = (employeeID) => {
        if (!customerSelected || invoiceItems.length === 0) {
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
                    margin: [0, 0, 0, 20],  // Thêm khoảng cách dưới tiêu đề
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
                    text: `Ngày lập: ${new Date().toLocaleDateString()}`,
                    margin: [0, 0, 0, 10],
                },
                {
                    text: `Nhân viên thực hiện: ${employeeID}`,
                    margin: [0, 0, 0, 20],
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: [
                            ['Tên thuốc', 'Số lượng', 'Đơn giá', 'Thành tiền'],
                            ...invoiceItems.map(item => [
                                item.name,
                                item.quantity,
                                `${item.price.toLocaleString()} VND`,
                                `${item.totalPrice.toLocaleString()} VND`
                            ])
                        ],
                    },
                    margin: [0, 20, 0, 0],
                },
                {
                    text: `Tổng giá: ${totalAmount.toLocaleString()} VND`,
                    bold: true,
                    alignment: 'right',
                    margin: [0, 20, 0, 0]
                }
            ],
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
                    <Table dataSource={invoiceItems} columns={columns} rowKey="id" pagination={false} />
                    <p style={{ marginTop: '10px', fontWeight: 'bold' }}>Tổng giá: {totalAmount.toLocaleString()} VND</p>
                    <div className="text-end">
                        <Button type="primary" onClick={confirmInvoice} style={{ marginTop: '10px' }}>
                            Xác nhận và in
                        </Button>
                    </div>
                </div>
            </div>

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
