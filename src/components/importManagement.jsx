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
        maNV: "",
        maNCC: "",
        maThuoc: "",
        ngayCungCap: null,
        soLuongThuocNhap: "",
        maCN: ChiNhanh,
        giaNhap: "",
    });

    const [isUpdate, setIsUpdate] = useState(false);

    useEffect(() => {
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
        { title: "Mã NV", dataIndex: "maNV", key: "maNV", ...getColumnSearchProps("maNV") },
        { title: "Mã NCC", dataIndex: "maNCC", key: "maNCC", ...getColumnSearchProps("maNCC") },
        { title: "Mã Thuốc", dataIndex: "maThuoc", key: "maThuoc", ...getColumnSearchProps("maThuoc") },
        {
            title: "Ngày Cung Cấp",
            dataIndex: "ngayCungCap",
            key: "ngayCungCap",
            render: (text) => (text ? dayjs(text).format("DD/MM/YYYY") : ""),
        },
        { title: "Số Lượng Nhập", dataIndex: "soLuongThuocNhap", key: "soLuongThuocNhap" },
        { title: "Mã CN", dataIndex: "maCN", key: "maCN" },
        { title: "Giá Nhập", dataIndex: "giaNhap", key: "giaNhap" },
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
            await axiosCus.put(
                URLUpdateCungCap(selectedCungCap.maNV, selectedCungCap.maNCC, selectedCungCap.maThuoc),
                payload
            );
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
                    await axiosCus.delete(
                        URLDeleteCungCap(selectedCungCap.maNV, selectedCungCap.maNCC, selectedCungCap.maThuoc)
                    );
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
            maNV: "",
            maNCC: "",
            maThuoc: "",
            ngayCungCap: null,
            soLuongThuocNhap: "",
            maCN: ChiNhanh,
            giaNhap: "",
        });
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
                        rowKey={(record) => `${record.maNV}-${record.maNCC}-${record.maThuoc}`}
                        pagination={{ pageSize: 10 }}
                        onRow={(record) => ({
                            onClick: () => setSelectedCungCap(record),
                        })}
                    />
                </div>
                <div className="col-md-4">
                    <h4 className="mb-3">Thông tin cung cấp</h4>
                    <div>
                        <p>
                            <label>Mã NV</label>
                            <Input
                                value={selectedCungCap.maNV}
                                onChange={(e) =>
                                    setSelectedCungCap({ ...selectedCungCap, maNV: e.target.value })
                                }
                            />
                        </p>
                        <p>
                            <label>Mã NCC</label>
                            <Input
                                value={selectedCungCap.maNCC}
                                onChange={(e) =>
                                    setSelectedCungCap({ ...selectedCungCap, maNCC: e.target.value })
                                }
                            />
                        </p>
                        <p>
                            <label>Mã Thuốc</label>
                            <Input
                                value={selectedCungCap.maThuoc}
                                onChange={(e) =>
                                    setSelectedCungCap({ ...selectedCungCap, maThuoc: e.target.value })
                                }
                            />
                        </p>
                        <p>
                            <label>Ngày Cung Cấp</label>
                            <DatePicker
                                value={selectedCungCap.ngayCungCap}
                                onChange={(date) =>
                                    setSelectedCungCap({
                                        ...selectedCungCap,
                                        ngayCungCap: date,
                                    })
                                }
                                format="DD/MM/YYYY"
                            />
                        </p>
                        <p>
                            <label>Số Lượng Nhập</label>
                            <Input
                                value={selectedCungCap.soLuongThuocNhap}
                                onChange={(e) =>
                                    setSelectedCungCap({
                                        ...selectedCungCap,
                                        soLuongThuocNhap: e.target.value,
                                    })
                                }
                            />
                        </p>
                        <p>
                            <label>Giá Nhập</label>
                            <Input
                                value={selectedCungCap.giaNhap}
                                onChange={(e) =>
                                    setSelectedCungCap({ ...selectedCungCap, giaNhap: e.target.value })
                                }
                            />
                        </p>
                        <div className="button-group">
                            <Button className="me-2" onClick={handleAdd} type="primary">
                                Thêm
                            </Button>
                            <Button className="me-2" onClick={handleUpdate} style={{ backgroundColor: "gold" }}>
                                Cập nhật
                            </Button>
                            <Button className="me-2" onClick={handleDelete} danger>
                                Xóa
                            </Button>
                            <Button onClick={handleClear} style={{ backgroundColor: "gray" }}>
                                Xóa thông tin
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ImportManagement;
