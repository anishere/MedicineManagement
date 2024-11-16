/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef, useState } from "react";
import { Table, Input, Button, Space, Modal, DatePicker } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { axiosCus } from "../axios/axios";
import {
    URLListCungCap,
    URLAddCungCap,
    URLUpdateCungCap,
    URLDeleteCungCap,
    ChiNhanh,
} from "../../URL/url";
import { toast } from "react-toastify";
import dayjs from "dayjs";

function ImportManagement() {
    const [listCungCap, setListCungCap] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef(null);

    const [selectedCungCap, setSelectedCungCap] = useState({
        idCungCap: "",
        maNV: "",
        maNCC: "",
        maThuoc: "",
        ngayCungCap: null,
        soLuongThuocNhap: "",
        maCN: ChiNhanh,
        giaNhap: "",
    });

    const [isUpdate, setIsUpdate] = useState(false);

    // States for filtering by day, month, and year
    const [filterDate, setFilterDate] = useState({
        day: 0, // Default 0 means no filter
        month: 0, // Default 0 means no filter
        year: 0, // Default 0 means no filter
    });

    // Fetch dữ liệu function
    const fetchData = async () => {
        try {
            const res = await axiosCus.get(URLListCungCap);
            const formattedData = res.listCungCap.map((item) => ({
                ...item,
                ngayCungCap: item.ngayCungCap
                    ? dayjs(item.ngayCungCap, "YYYY-MM-DD")
                    : null,
            }));
            setListCungCap(formattedData || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // Fetch data when the component is first rendered
    useEffect(() => {
        fetchData();
    }, [isUpdate]);

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText("");
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: "block" }}
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
            <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ""}
                />
            ) : (
                text
            ),
    });

    const columns = [
        { title: "ID Cung Cấp", dataIndex: "idCungCap", key: "idCungCap" },
        { title: "Mã NV", dataIndex: "maNV", key: "maNV", ...getColumnSearchProps("maNV") },
        { title: "Mã NCC", dataIndex: "maNCC", key: "maNCC", ...getColumnSearchProps("maNCC") },
        { title: "Mã Thuốc", dataIndex: "maThuoc", key: "maThuoc", ...getColumnSearchProps("maThuoc") },
        {
            title: "Ngày Cung Cấp",
            dataIndex: "ngayCungCap",
            key: "ngayCungCap",
            render: (text) => (text ? dayjs(text).format("DD/MM/YYYY") : ""),
        },
        { title: "Số Lượng Nhập", dataIndex: "soLuongThuocNhap", key: "soLuongThuocNhap", ...getColumnSearchProps("soLuongThuocNhap") },
        { title: "Giá Nhập", dataIndex: "giaNhap", key: "giaNhap", ...getColumnSearchProps("giaNhap") },
    ];

    const handleAdd = async () => {
        try {
            const payload = {
                ...selectedCungCap,
                ngayCungCap: selectedCungCap.ngayCungCap?.format("YYYY-MM-DD"),
            };
            await axiosCus.post(URLAddCungCap, payload);
            toast.success("Thêm thành công!");
            setIsUpdate(!isUpdate);
            handleClear();
        } catch (error) {
            console.error("Error adding record:", error);
            toast.error("Thêm thất bại!");
        }
    };

    const handleUpdate = async () => {
        try {
            const payload = {
                ...selectedCungCap,
                ngayCungCap: selectedCungCap.ngayCungCap?.format("YYYY-MM-DD"),
            };
            await axiosCus.put(`${URLUpdateCungCap}${selectedCungCap.idCungCap}`, payload);
            toast.success("Cập nhật thành công!");
            setIsUpdate(!isUpdate);
            handleClear();
        } catch (error) {
            console.error("Error updating record:", error);
            toast.error("Cập nhật thất bại!");
        }
    };

    const handleDelete = async () => {
        Modal.confirm({
            title: "Xác nhận xóa",
            content: "Bạn có chắc chắn muốn xóa bản ghi này?",
            okText: "Xác nhận",
            cancelText: "Hủy bỏ",
            onOk: async () => {
                try {
                    await axiosCus.delete(`${URLDeleteCungCap}${selectedCungCap.idCungCap}`);
                    toast.success("Xóa thành công!");
                    setIsUpdate(!isUpdate);
                    handleClear();
                } catch (error) {
                    console.error("Error deleting record:", error);
                    toast.error("Xóa thất bại!");
                }
            },
        });
    };

    const handleClear = () => {
        setSelectedCungCap({
            idCungCap: "",
            maNV: "",
            maNCC: "",
            maThuoc: "",
            ngayCungCap: null,
            soLuongThuocNhap: "",
            maCN: ChiNhanh,
            giaNhap: "",
        });
    };

    const handleFilter = () => {
        let filteredData = listCungCap;

        if (filterDate.day !== 0) {
            filteredData = filteredData.filter(item => dayjs(item.ngayCungCap).date() === filterDate.day);
        }

        if (filterDate.month !== 0) {
            filteredData = filteredData.filter(item => dayjs(item.ngayCungCap).month() + 1 === filterDate.month);
        }

        if (filterDate.year !== 0) {
            filteredData = filteredData.filter(item => dayjs(item.ngayCungCap).year() === filterDate.year);
        }

        setListCungCap(filteredData);
    };

    const handleResetFilter = () => {
        setFilterDate({ day: 0, month: 0, year: 0 });
        fetchData(); // Reset to the original list
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-8">
                    <h4 className="mb-3">Danh sách cung cấp</h4>
                    <Table
                        className="table-cungcap"
                        columns={columns}
                        dataSource={listCungCap}
                        rowKey="idCungCap"
                    />
                </div>

                <div className="col-md-4">
                    <h4 className="mb-3">Thêm / Cập nhật cung cấp</h4>
                    <div className="form-group">
                        <label htmlFor="maNV">Mã NV:</label>
                        <Input
                            id="maNV"
                            value={selectedCungCap.maNV}
                            onChange={(e) => setSelectedCungCap({ ...selectedCungCap, maNV: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="maNCC">Mã NCC:</label>
                        <Input
                            id="maNCC"
                            value={selectedCungCap.maNCC}
                            onChange={(e) => setSelectedCungCap({ ...selectedCungCap, maNCC: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="maThuoc">Mã Thuốc:</label>
                        <Input
                            id="maThuoc"
                            value={selectedCungCap.maThuoc}
                            onChange={(e) => setSelectedCungCap({ ...selectedCungCap, maThuoc: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="ngayCungCap">Ngày Cung Cấp:</label>
                        <DatePicker
                            id="ngayCungCap"
                            value={selectedCungCap.ngayCungCap}
                            onChange={(date) => setSelectedCungCap({ ...selectedCungCap, ngayCungCap: date })}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="soLuongThuocNhap">Số Lượng Nhập:</label>
                        <Input
                            id="soLuongThuocNhap"
                            value={selectedCungCap.soLuongThuocNhap}
                            onChange={(e) => setSelectedCungCap({ ...selectedCungCap, soLuongThuocNhap: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="giaNhap">Giá Nhập:</label>
                        <Input
                            id="giaNhap"
                            value={selectedCungCap.giaNhap}
                            onChange={(e) => setSelectedCungCap({ ...selectedCungCap, giaNhap: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <Button type="primary" onClick={isUpdate ? handleUpdate : handleAdd}>
                            {isUpdate ? "Cập nhật" : "Thêm"}
                        </Button>
                        {isUpdate && (
                            <Button danger onClick={handleDelete} style={{ marginLeft: "10px" }}>
                                Xóa
                            </Button>
                        )}
                        <Button onClick={handleClear} style={{ marginLeft: "10px" }}>
                            Hủy
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="filter-section">
                <h5>Filter</h5>
                <div className="row">
                    <div className="col-md-4">
                        <label>Ngày</label>
                        <Input
                            type="number"
                            value={filterDate.day || ""}
                            onChange={(e) => setFilterDate({ ...filterDate, day: parseInt(e.target.value) })}
                            placeholder="Day"
                        />
                    </div>
                    <div className="col-md-4">
                        <label>Tháng</label>
                        <Input
                            type="number"
                            value={filterDate.month || ""}
                            onChange={(e) => setFilterDate({ ...filterDate, month: parseInt(e.target.value) })}
                            placeholder="Month"
                        />
                    </div>
                    <div className="col-md-4">
                        <label>Năm</label>
                        <Input
                            type="number"
                            value={filterDate.year || ""}
                            onChange={(e) => setFilterDate({ ...filterDate, year: parseInt(e.target.value) })}
                            placeholder="Year"
                        />
                    </div>
                </div>
                <div className="mt-3">
                    <Button onClick={handleFilter} type="primary">Áp Dụng Lọc</Button>
                    <Button onClick={handleResetFilter} style={{ marginLeft: "10px" }}>Reset Lọc</Button>
                </div>
            </div>
        </div>
    );
}

export default ImportManagement;
