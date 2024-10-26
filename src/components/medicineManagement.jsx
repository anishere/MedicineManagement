/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef, useState } from "react";
import { URLAddMedicine, URLCategory, URLDeleteMedicine, URLListMedicine, URLMedicineByID, URLUpdateMedicine, URLUploadImg } from "../../URL/url";
import { axiosCus } from "../axios/axios";
import { Table, Input, Button, Space } from "antd";
import { FolderOpenOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import TextArea from "antd/es/input/TextArea";
import { Bounce, toast } from "react-toastify";
import dayjs from "dayjs";

function MedicineManagement() {
    const [listMedicine, setListMedicine] = useState([]);
    const [filteredMedicine, setFilteredMedicine] = useState([]); // Lưu thuốc sau khi lọc
    const [isExpiredFilter, setIsExpiredFilter] = useState(false); // Kiểm tra trạng thái lọc thuốc hết hạn
    const [isNearExpiryFilter, setIsNearExpiryFilter] = useState(false);
    const [currentFilterLabel, setCurrentFilterLabel] = useState("Danh sách thuốc (tất cả)");

    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    const [idSelected, setIdSelected] = useState('');
    const [medicineData, setMedicineData] = useState();
    const [category, setCategory] = useState();

    const [isUpdate, setIsUpdate] = useState(false)

    const [medicine, setMedicine] = useState({
        MaThuoc: '',
        TenThuoc: '',
        DMThuoc: '',
        GiaBan: 0,
        NgaySanXuat: '',
        NgayHetHan: '',
        SoLuongThuocCon: 0,
        CongDung: '',
        DVT: '',
        HinhAnh: '',
        MaDanhMuc: '',
        KeDon: '',
        XuatXu: '',
        KhuVucLuuTru: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosCus.get(URLListMedicine);
                const formattedData = res.listMedicine.map(medicine => ({
                    ...medicine,
                    ngaySanXuatFormatted: dayjs(medicine.ngaySanXuat).format('DD/MM/YYYY'),
                    ngayHetHanFormatted: dayjs(medicine.ngayHetHan).format('DD/MM/YYYY')
                }));
                setListMedicine(formattedData); 
                setFilteredMedicine(formattedData); // Ban đầu hiển thị tất cả thuốc
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [isUpdate]);

    // Lọc thuốc hết hạn
    const filterExpiredMedicines = () => {
        const currentDate = dayjs();
        const expired = listMedicine.filter(medicine => dayjs(medicine.ngayHetHan).isBefore(currentDate));
        setFilteredMedicine(expired);
        setIsExpiredFilter(true);
        setIsNearExpiryFilter(false); // Đảm bảo lọc riêng biệt
        setCurrentFilterLabel("Danh sách thuốc hết hạn");
    };

    // Lọc thuốc gần hết hạn
    const filterNearExpiryMedicines = () => {
        const currentDate = dayjs();
        const nearExpiry = listMedicine.filter(medicine => 
            dayjs(medicine.ngayHetHan).isAfter(currentDate) && 
            dayjs(medicine.ngayHetHan).diff(currentDate, 'month') < 1
        );
        setFilteredMedicine(nearExpiry);
        setIsNearExpiryFilter(true);
        setIsExpiredFilter(false); // Đảm bảo lọc riêng biệt
        setCurrentFilterLabel("Danh sách thuốc gần hết hạn"); 
    };
    
    // Hiển thị tất cả thuốc
    const showAllMedicines = () => {
        setFilteredMedicine(listMedicine);
        setIsExpiredFilter(false);
        setIsNearExpiryFilter(false);
        setCurrentFilterLabel("Danh sách thuốc (tất cả)");
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

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

    const getIDMedicine = (medicineID) => {
        setIdSelected(medicineID);
    };

    // Cấu hình cột cho bảng
    const columns = [
        { title: 'Mã', dataIndex: 'maThuoc', key: 'maThuoc', ...getColumnSearchProps('maThuoc') },
        { title: 'Tên', dataIndex: 'tenThuoc', key: 'tenThuoc', ...getColumnSearchProps('tenThuoc') },
        { title: 'Danh mục', dataIndex: 'maDanhMuc', key: 'maDanhMuc', ...getColumnSearchProps('maDanhMuc') },
        { title: 'Số lượng', dataIndex: 'soLuongThuocCon', key: 'soLuongThuocCon' },
        { title: 'Giá', dataIndex: 'giaBan', key: 'giaBan' },
        { title: 'Đơn vị', dataIndex: 'dvt', key: 'dvt' },
        { 
            title: 'Ngày sản xuất', 
            dataIndex: 'ngaySanXuatFormatted', // Hiển thị ngày đã định dạng
            key: 'ngaySanXuat', 
            render: (text) => text, // Hiển thị ngày, tháng, năm đã định dạng
            ...getColumnSearchProps('ngaySanXuat') // Lọc vẫn dùng trường gốc `ngaySanXuat`
        },
        { 
            title: 'Ngày hết hạn', 
            dataIndex: 'ngayHetHanFormatted', // Hiển thị ngày đã định dạng
            key: 'ngayHetHan', 
            render: (text) => text, // Hiển thị ngày, tháng, năm đã định dạng
            ...getColumnSearchProps('ngayHetHan') // Lọc vẫn dùng trường gốc `ngayHetHan`
        },
        { title: 'Kê Đơn', dataIndex: 'keDon', key: 'keDon', ...getColumnSearchProps('keDon') },
    ];    

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosCus.get(`${URLMedicineByID}${idSelected}`);
                setMedicineData(res.listMedicine[0]); 
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [idSelected])

    useEffect(() => {
        {
            if(medicineData) {
                setMedicine({
                    MaThuoc: medicineData.maThuoc,
                    TenThuoc: medicineData.tenThuoc,
                    GiaBan: medicineData.giaBan,
                    NgaySanXuat: medicineData.ngaySanXuat,
                    NgayHetHan: medicineData.ngayHetHan,
                    SoLuongThuocCon: medicineData.soLuongThuocCon,
                    CongDung: medicineData.congDung,
                    DVT: medicineData.dvt,
                    HinhAnh: medicineData.hinhAnh,
                    MaDanhMuc: medicineData.maDanhMuc,
                    KeDon: medicineData.keDon,
                    XuatXu: medicineData.xuatXu,
                    KhuVucLuuTru: medicineData.khuVucLuuTru
                });
            }
        }
    }, [medicineData])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosCus.get(URLCategory);
                setCategory(res.listCategories); 
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    },[])
    
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        // Lưu file hình ảnh vào state để hiển thị preview
        const imageUrlPreview = URL.createObjectURL(file);
    
        // Lưu cả file và URL preview vào state để dùng khi nhấn nút Cập nhật
        setMedicine((prev) => ({
            ...prev,
            HinhAnh: imageUrlPreview,
            newImageFile: file,  // Lưu file ảnh để gửi lên server sau
        }));
    };
    
    const handleUpdateMedicine = async () => {
        if ( idSelected !== '') {
            try {
                let updatedMedicine = { ...medicine };
        
                // Nếu có ảnh mới, upload ảnh trước
                if (medicine.newImageFile) {
                    const formData = new FormData();
                    formData.append('file', medicine.newImageFile);
        
                    const uploadResponse = await axiosCus.post(URLUploadImg, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
        
                    // Cập nhật đường dẫn ảnh mới vào dữ liệu thuốc
                    updatedMedicine.HinhAnh = uploadResponse.imageUrl;
                }
                
                // Gửi dữ liệu thuốc đã được cập nhật (sử dụng phương thức PUT nếu cần)
                const response = await axiosCus.put(`${URLUpdateMedicine}${medicine.MaThuoc}`, updatedMedicine);
                console.log('Medicine updated successfully', response.status);
                toast.success('Cập nhật thành công', {
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
                setIsUpdate(!isUpdate);
            } catch (error) {
                console.error('Error saving medicine:', error);
                toast.error('Cập nhật thất bại',error, {
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
            }
        } else {
            toast.warn('Chưa chọn thuốc để cập nhật', {
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
        }
    };

    const handleAddMedicine = () => {
        // Kiểm tra nếu MaThuoc đã tồn tại trong listMedicine
        const isDuplicate = listMedicine.some(med => med.MaThuoc === medicine.MaThuoc);
    
        if (isDuplicate) {
            // Nếu MaThuoc trùng, thông báo cho người dùng
            toast.warn('Mã thuốc đã tồn tại, hãy nhập mã khác', {
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
            return; // Không thực hiện thêm thuốc
        }

        if (medicine.MaDanhMuc === '' || medicine.NgaySanXuat === '' || medicine.NgayHetHan === '' || medicine.MaThuoc === '') {
            // Nếu mã thuốc chưa được nhập, thông báo cho người dùng
            toast.warn('Vui lòng điển đủ thông tin yêu cầu để thêm', {
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
            return; // Dừng thực hiện khi không có mã thuốc
        }
    
            // Nếu không trùng, tiến hành thêm thuốc
        const fetchData = async () => {
            try {
                const res = await axiosCus.post(URLAddMedicine, medicine);
                console.log('Medicine added successfully:', res.data);
                toast.success('Thêm thuốc mới thành công', {
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
                setIsUpdate(!isUpdate);
            } catch (error) {
                console.error('Lỗi thêm sản phẩm', error);
                toast.error('Cập nhật thất bại',error.message, {
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
            }        
        };
        fetchData();
    };    

    const handleClearDataMedi = () => {
        setMedicine({
            MaThuoc: '',
            TenThuoc: '',
            DMThuoc: '',
            GiaBan: 0,
            NgaySanXuat: '',
            NgayHetHan: '',
            SoLuongThuocCon: 0,
            CongDung: '',
            DVT: '',
            HinhAnh: '',
            MaDanhMuc: '',
            KeDon: '',
            XuatXu: '',
            KhuVucLuuTru: '',
        });
    }
    
    const handleDeleteMedicine = () => {
        // Kiểm tra nếu MaThuoc không tồn tại trong listMedicine
        const isExist = listMedicine.some(med => med.maThuoc === idSelected);
    
        if (medicine.MaThuoc === '') {
            // Nếu mã thuốc chưa được nhập, thông báo cho người dùng
            toast.warn('Vui lòng nhập mã thuốc để xóa', {
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
            return; // Dừng thực hiện khi không có mã thuốc
        }
    
        if (!isExist) {
            // Nếu mã thuốc không tồn tại, thông báo cho người dùng
            toast.warn('Mã thuốc không tồn tại, không thể xóa', {
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
            return; // Dừng thực hiện nếu mã thuốc không tồn tại
        }
    
        // Nếu mã thuốc tồn tại, tiến hành xóa thuốc
        const fetchData = async () => {
            try {
                const res = await axiosCus.delete(`${URLDeleteMedicine}${idSelected}`);
                console.log('Medicine deleted successfully:', res.data);
                toast.success('Xóa thuốc thành công', {
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
                setIsUpdate(!isUpdate); // Cập nhật lại danh sách
            } catch (error) {
                console.error('Lỗi khi xóa sản phẩm', error);
                toast.error('Xóa thuốc thất bại', {
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
            }
        };
        fetchData();
    };    
     
    return (
    <>
        <div className="wrap-medicine">
            <div className="filter-buttons mb-3">
                <Button 
                    type="primary" 
                    onClick={filterExpiredMedicines} 
                    disabled={isExpiredFilter}
                    className="me-2"
                >
                    Lọc thuốc hết hạn
                </Button>
                <Button 
                    type="warning" 
                    onClick={filterNearExpiryMedicines} 
                    disabled={isNearExpiryFilter}
                    className="me-2"
                >
                    Lọc thuốc gần hết hạn
                </Button>
                <Button 
                    onClick={showAllMedicines} 
                    disabled={!isExpiredFilter && !isNearExpiryFilter}
                >
                    Hiện tất cả thuốc
                </Button>
            </div>

            <h4 className="mb-3">{currentFilterLabel}</h4>
            <Table
                className="table-medicine"
                columns={columns}
                dataSource={filteredMedicine} // Sử dụng danh sách thuốc
                rowKey="maThuoc" // Đặt key cho mỗi dòng
                pagination={{ pageSize: 10 }} // Chia trang
                onRow={(record) => ({
                    onClick: () => {
                        getIDMedicine(record.maThuoc); // Lấy ID khi nhấn vào dòng
                    },
                    onMouseEnter: (e) => {
                        e.currentTarget.style.cursor = 'pointer'; // Thêm hiệu ứng con trỏ khi di chuột
                    },
                })}
            />

            <div className="sec-infoMedicine">
                <h3 className="mb-3">THÔNG TIN THUỐC</h3>
                <div className="infoMedicine-detail d-flex">
                    <div className="col-4 me-4">
                        <p className="d-flex align-items-center">
                            <label htmlFor="" className="col-3 text-start fw-bold">Mã thuốc</label>
                            <Input value={medicine.MaThuoc} onChange={e => setMedicine({ ...medicine, MaThuoc: e.target.value })} className="col-9" />                        
                        </p>
                        <p className="d-flex align-items-center">
                            <label htmlFor="" className="col-3 text-start fw-bold">Tên thuốc</label>
                            <Input value={medicine.TenThuoc} onChange={e => setMedicine({ ...medicine, TenThuoc: e.target.value })} className="col-9" />                        
                        </p>
                        <p className="d-flex align-items-center">
                            <label className="col-3 text-start fw-bold" htmlFor="medicineCategory">Danh Mục</label>
                            <select value={medicine.MaDanhMuc} 
                            className="form-control col-9" 
                            id="medicineCategory"
                            onChange={(e) => setMedicine({ ...medicine, MaDanhMuc: e.target.value })}
                            >
                                <option value="" disabled>
                                Chọn danh mục
                                </option>
                                {category && category.map((category) => (
                                    <option key={category.maDanhMuc} value={category.maDanhMuc}>
                                        {category.maDanhMuc}
                                    </option>
                                ))}
                            </select>                        
                        </p>
                        <p className="d-flex align-items-center">
                            <label htmlFor="" className="col-3 text-start fw-bold">Thuốc kê đơn</label>
                            <Input value={medicine.KeDon} onChange={e => setMedicine({ ...medicine, KeDon: e.target.value })} className="col-9" />                        
                        </p>
                        <p className="d-flex align-items-center">
                            <label htmlFor="" className="col-3 text-start fw-bold">Đơn vị tính</label>
                            <Input value={medicine.DVT} onChange={e => setMedicine({ ...medicine, DVT: e.target.value })} className="col-9" />                        
                        </p>
                        <p className="d-flex align-items-center">
                            <label htmlFor="" className="col-3 text-start fw-bold">Số lượng</label>
                            <Input type="number" value={medicine.SoLuongThuocCon} onChange={e => setMedicine({ ...medicine, SoLuongThuocCon: e.target.value })} className="col-9" />                        
                        </p>
                        <p className="d-flex align-items-center">
                            <label htmlFor="" className="col-3 text-start fw-bold">Giá bán</label>
                            <Input value={medicine.GiaBan} onChange={e => setMedicine({ ...medicine, GiaBan: e.target.value })} className="col-9" />                        
                        </p>
                    </div>
                    <div className="col-4">
                        <p className="d-flex align-items-center">
                            <label htmlFor="" className="col-3 text-start fw-bold">Xuất xứ</label>
                            <Input value={medicine.XuatXu} onChange={e => setMedicine({ ...medicine, XuatXu: e.target.value })} className="col-9" />                        
                        </p>
                        <p className="d-flex align-items-center">
                            <label htmlFor="" className="col-3 text-start fw-bold">Khu vực lưu trữ</label>
                            <Input value={medicine.KhuVucLuuTru} onChange={e => setMedicine({ ...medicine, KhuVucLuuTru: e.target.value })} className="col-9" />                        
                        </p>
                        <p className="d-flex align-items-center">
                            <label htmlFor="" className="col-3 text-start fw-bold">Ngày sản xuất</label>
                            <Input 
                                type="date" 
                                value={medicine.NgaySanXuat.split('T')[0]}  // Chỉ lấy phần ngày (YYYY-MM-DD)
                                onChange={e => setMedicine({ ...medicine, NgaySanXuat: e.target.value })} 
                                className="col-9" 
                            />                        
                        </p>
                        <p className="d-flex align-items-center">
                            <label htmlFor="" className="col-3 text-start fw-bold">Ngày hết hạn</label>
                            <Input 
                                type="date" 
                                value={medicine.NgayHetHan.split('T')[0]}  // Chỉ lấy phần ngày (YYYY-MM-DD)
                                onChange={e => setMedicine({ ...medicine, NgayHetHan: e.target.value })} 
                                className="col-9" 
                            />                        
                        </p>
                        <p className="d-flex align-items-center">
                            <label htmlFor="" className="col-3 text-start fw-bold">Công dụng</label>
                            <TextArea rows={4} value={medicine.CongDung} onChange={e => setMedicine({ ...medicine, CongDung: e.target.value })} className="col-9" />                        
                        </p>
                        <p className="my-0 warning-text">*Mã thuốc, Danh mục thuốc, Ngày sản xuất và ngày hết hạn là các nội dung bắt buộc</p>
                    </div>
                    <div className="col-2 mx-4">
                        <div className="d-flex flex-column text-center align-items-center">
                            {/* Hiển thị ảnh preview nếu đã chọn, nếu không hiển thị ảnh mặc định */}
                            <img src={medicine.HinhAnh ? medicine.HinhAnh : '/imgStore/default.png'} className="img-medicine" alt="Medicine Image" />

                            {/* Label để trigger file input */}
                            <label htmlFor="file-input" className="mt-2 styled-label">Chọn ảnh <FolderOpenOutlined /></label>

                            {/* Input để chọn file hình ảnh */}
                            <input
                                id="file-input"
                                type="file"
                                accept="image/*" // Chỉ cho phép file hình ảnh
                                onChange={handleImageUpload}
                                className="file-input"
                            />
                        </div>
                    </div>
                    <div className="col-2">
                        <p><button onClick={handleAddMedicine} className="btn-effectMedicine btn btn-info">Thêm</button></p>
                        <p><button onClick={handleUpdateMedicine} className="btn-effectMedicine btn btn-warning">Cập nhật</button></p>
                        <p><button onClick={handleDeleteMedicine} className="btn-effectMedicine btn btn-danger">Xóa</button></p>
                        <p><button onClick={handleClearDataMedi} className="btn-effectMedicine btn btn-secondary">Xóa thông tin</button></p>
                    </div>
                </div>
            </div>
        </div>
    </>
    );
}

export default MedicineManagement;
