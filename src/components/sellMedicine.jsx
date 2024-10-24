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
import { PrinterOutlined } from "@ant-design/icons";

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
    const [employees, setEmployees] = useState()
    
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
            Modal.warning({
                title: 'Thông báo',
                content: 'Vui lòng chọn khách hàng và thêm ít nhất một thuốc.',
                okText: 'Đóng',
            });
            return; // Dừng hàm nếu điều kiện không thỏa mãn
        }
    
        const employeeID = localStorage.getItem('maNV');
    
        try {
            // Tạo modal với 3 tùy chọn
            Modal.confirm({
                title: 'Xác nhận hành động',
                content: 'Bạn muốn thực hiện hành động gì cho hóa đơn này?',
                footer: (
                    <div style={{ textAlign: "center" }}>
                        <Button onClick={async () => {
                            // Chỉ xác nhận đơn hàng mà không in
                            await createInvoice(employeeID);
                            toast.success('Hóa đơn đã được tạo thành công mà không in', {
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
                            Modal.destroyAll(); // Đóng modal sau khi hành động hoàn tất
                        }}>
                            Chỉ xác nhận
                        </Button>
                        <Button className="mx-2" onClick={async () => {
                            // Xác nhận và in hóa đơn
                            await createInvoice(employeeID);  // Gọi hàm tạo hóa đơn
                            generatePDF();  // Gọi hàm in hóa đơn
                            Modal.destroyAll(); // Đóng modal sau khi hành động hoàn tất
                        }}>
                            In hóa đơn
                        </Button>
                        <Button onClick={() => {
                            // Hủy hành động
                            toast.info('Bạn đã hủy hành động.', {
                                position: "top-right",
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: "light",
                                transition: Bounce,
                            });
                            Modal.destroyAll(); // Đóng modal khi chọn hủy
                        }}>
                            Hủy
                        </Button>
                    </div>
                ),
                onCancel() {
                    // Không hành động gì khi chọn "Hủy" từ nút X
                    Modal.destroyAll();
                }
            });
        } catch (error) {
            console.error('Error creating invoice:', error);
            Modal.error({
                title: 'Lỗi',
                content: 'Lỗi khi tạo hóa đơn. Vui lòng thử lại.',
                okText: 'Đóng',
            });
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
        if (invoiceItems.length <= 0) {
            Modal.warning({
                title: 'Thông báo',
                content: 'Chưa có thông tin hóa đơn để in.',
                okText: 'Đóng',
            });
            return;
        }
    
        // Hiển thị hộp thoại xác nhận rằng in hóa đơn sẽ tự động xác nhận đơn hàng
        Modal.confirm({
            title: 'Xác nhận in hóa đơn',
            content: 'Việc in hóa đơn sẽ tự động xác nhận đơn hàng. Bạn có muốn tiếp tục?',
            okText: 'In và xác nhận',
            cancelText: 'Hủy',
            onOk: async () => {
                // Nếu người dùng đồng ý, gọi luôn hàm xác nhận đơn hàng
                await confirmInvoice();
            },
            onCancel() {
                console.log('Đã hủy in hóa đơn');
            },
        });
    };

    const createInvoice = async (employeeID) => {
        try {
            // Tạo hóa đơn
            const invoiceRes = await axiosCus.post(URLCreateInvoice, {
                maNV: employeeID,
                maKH: customerSelected.maKH,
                ngayBan: new Date().toISOString(),
                maCN: ChiNhanh,
                tongGia: invoiceItems.reduce((acc, item) => acc + item.totalPrice, 0)
            });
    
            const maHD = invoiceRes.maHD;
    
            // Thêm thuốc vào hóa đơn
            for (const item of invoiceItems) {
                await axiosCus.post(URLAddMedicineToInvoice, {
                    MaHD: maHD,
                    MaThuoc: item.id,
                    SoLuongBan: item.quantity,
                    MaCN: ChiNhanh
                });
            }
    
            // Hiển thị thông báo thành công
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
    
            // Xóa danh sách thuốc sau khi tạo hóa đơn thành công
            setInvoiceItems([]);
        } catch (error) {
            console.error('Error creating invoice:', error);
            throw error; // Đẩy lỗi ra ngoài để xử lý
        }
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
                    <div className="text-end">
                    <Button type="primary" onClick={confirmInvoice} style={{ marginTop: '10px' }}>
                        Xác nhận
                    </Button>
                    <Button type="default" onClick={generatePDF} style={{ marginTop: '10px', marginLeft: '10px' }}>
                        In <PrinterOutlined />
                    </Button>
                    </div>
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
