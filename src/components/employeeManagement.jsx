/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { Table, Input, Button, Space, Modal, DatePicker, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { axiosCus } from "../axios/axios";
import { URLListEmployee, URLEmployeID, URLAddEmployee, URLUpdate, URLDeleteEmployee, ChiNhanh } from "../../URL/url";
import { toast } from "react-toastify";
import dayjs from "dayjs";

function EmployeeManagement() {
    const [listNhanVien, setListNhanVien] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [employee, setEmployee] = useState({
        maNV: "",
        tenNV: "",
        gt: "",
        ngaySinh: null,
        sdt: "",
        luong: 0,
        maCN: ChiNhanh,
    });
    const [idSelected, setIdSelected] = useState("");
    const [isUpdate, setIsUpdate] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef(null);
    const [salaryFilter, setSalaryFilter] = useState("");
    const [salaryCondition, setSalaryCondition] = useState(">");

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await axiosCus.get(URLListEmployee);
                const formattedData = response.listNhanVien.map((employee) => ({
                    ...employee,
                    ngaySinh: dayjs(employee.ngaySinh).format("DD/MM/YYYY")
                }));
                setListNhanVien(formattedData);
                setFilteredData(formattedData); // Khởi tạo dữ liệu đã lọc bằng dữ liệu gốc
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };
        fetchEmployees();
    }, [isUpdate]);

    const handleSalaryFilter = () => {
        const salaryValue = parseFloat(salaryFilter);
        if (isNaN(salaryValue)) {
            toast.warn("Vui lòng nhập một số hợp lệ cho lương");
            return;
        }
    
        // Khởi tạo mảng rỗng để lưu kết quả sau khi lọc
        const filtered = [];
    
        // Duyệt qua từng nhân viên trong danh sách và áp dụng điều kiện
        listNhanVien.forEach((employee) => {
            const employeeSalary = parseFloat(employee.luong);
    
            // Kiểm tra điều kiện và thêm vào mảng `filtered` nếu thỏa mãn
            if ((salaryCondition === ">" && employeeSalary > salaryValue) ||
                (salaryCondition === "<" && employeeSalary < salaryValue)) {
                filtered.push(employee);
            }
        });
    
        // Cập nhật danh sách đã lọc
        setFilteredData(filtered);
    };    

    const handleResetFilter = () => {
        setFilteredData(listNhanVien); // Trở về danh sách ban đầu
        setSalaryFilter("");
        setSalaryCondition(">");
    };

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
                {dataIndex === "ngaySinh" ? (
                    <DatePicker
                        ref={searchInput}
                        placeholder="Chọn ngày"
                        format="DD/MM/YYYY"
                        onChange={(date) => setSelectedKeys(date ? [dayjs(date).format("YYYY-MM-DD")] : [])}
                        style={{ marginBottom: 8, display: "block" }}
                    />
                ) : (
                    <Input
                        ref={searchInput}
                        placeholder={`Search ${dataIndex}`}
                        value={selectedKeys[0]}
                        onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        style={{ marginBottom: 8, display: "block" }}
                    />
                )}
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
        onFilter: (value, record) => {
            if (dataIndex === "ngaySinh") {
                return dayjs(record[dataIndex]).format("YYYY-MM-DD") === value;
            }
            return record[dataIndex].toString().toLowerCase().includes(value.toLowerCase());
        },
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

    const handleAddEmployee = async () => {
        if (!employee.tenNV || !employee.sdt) {
            toast.warn("Vui lòng điền đủ thông tin.");
            return;
        }
        try {
            await axiosCus.post(URLAddEmployee, employee);
            toast.success("Thêm nhân viên thành công!");
            setIsUpdate(!isUpdate);
            handleClearDataEmployee();
        } catch (error) {
            console.error("Error adding employee:", error);
            toast.error("Không thể thêm nhân viên.");
        }
    };

    const handleUpdateEmployee = async () => {
        // Kiểm tra xem mã NV có được nhập hay không
        if (!employee.maNV) {
            toast.warn("Mã nhân viên không hợp lệ hoặc chưa được nhập.");
            return;
        }
    
        // Kiểm tra xem mã NV có tồn tại trong danh sách nhân viên
        const employeeExists = listNhanVien.some((nv) => nv.maNV === employee.maNV);
        if (!employeeExists) {
            toast.warn("Mã nhân viên không tồn tại trong hệ thống.");
            return;
        }
    
        try {
            // Thực hiện cập nhật nếu mã NV tồn tại
            await axiosCus.put(`${URLUpdate}${employee.maNV}`, employee);
            toast.success("Cập nhật thông tin thành công!");
            setIsUpdate(!isUpdate);
        } catch (error) {
            console.error("Error updating employee:", error);
            toast.error("Không thể cập nhật thông tin.");
        }
    };    

    const handleDeleteEmployee = () => {
        if (!idSelected) {
            toast.warn("Chọn nhân viên cần xóa.");
            return;
        }
        Modal.confirm({
            title: "Xóa nhân viên",
            content: "Bạn có chắc chắn muốn xóa nhân viên này?",
            okText: "Xóa",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await axiosCus.delete(`${URLDeleteEmployee}${idSelected}`);
                    toast.success("Xóa thành công!");
                    setIsUpdate(!isUpdate);
                } catch (error) {
                    console.error("Error deleting employee:", error);
                    toast.error("Không thể xóa nhân viên.");
                }
            },
        });
    };

    const handleClearDataEmployee = () => {
        setEmployee({
            maNV: "",
            tenNV: "",
            gt: "",
            ngaySinh: null,
            sdt: "",
            luong: 0,
            maCN: ChiNhanh,
        });
        setIdSelected("");
    };

    const handleSelectEmployee = async (record) => {
        setIdSelected(record.maNV);
        try {
            const response = await axiosCus.get(`${URLEmployeID}${record.maNV}`);
            const { maNV, tenNV, gt, ngaySinh, sdt, luong, maCN } = response.listNhanVien[0];
            setEmployee({
                maNV,
                tenNV,
                gt,
                ngaySinh: dayjs(ngaySinh),
                sdt,
                luong,
                maCN,
            });
        } catch (error) {
            console.error("Error fetching employee data:", error);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
    };

    const columns = [
        { title: "Mã NV", dataIndex: "maNV", key: "maNV", ...getColumnSearchProps("maNV") },
        { title: "Tên NV", dataIndex: "tenNV", key: "tenNV", ...getColumnSearchProps("tenNV") },
        { title: "Giới Tính", dataIndex: "gt", key: "gt", ...getColumnSearchProps("gt") },
        { title: "SĐT", dataIndex: "sdt", key: "sdt", ...getColumnSearchProps("sdt") },
        { 
            title: "Ngày Sinh", 
            dataIndex: "ngaySinh", 
            key: "ngaySinh", 
            render: (text) => dayjs(text).isValid() ? dayjs(text).format("DD/MM/YYYY") : text,
            ...getColumnSearchProps("ngaySinh") 
        },
        { title: "Lương", dataIndex: "luong", key: "luong", render: (text) => formatCurrency(text) },
    ];

    return (
        <div className="container">
            <div className="mb-4">
                <h4 className="mb-3">Lọc Lương</h4>
                <Space>
                    <Input
                        type="number"
                        placeholder="Nhập lương"
                        value={salaryFilter}
                        onChange={(e) => setSalaryFilter(e.target.value)}
                        style={{ width: 120 }}
                    />
                    <Select
                        value={salaryCondition}
                        onChange={(value) => setSalaryCondition(value)}
                        style={{ width: 120 }}
                    >
                        <Select.Option value=">">Lớn hơn</Select.Option>
                        <Select.Option value="<">Nhỏ hơn</Select.Option>
                    </Select>
                    <Button type="primary" onClick={handleSalaryFilter}>
                        Lọc
                    </Button>
                    <Button onClick={handleResetFilter}>
                        Bỏ lọc
                    </Button>
                </Space>
            </div>
            
            <div className="row">
                <div className="col-md-7 col-12">
                    <h4 className="mb-3">Danh Sách Nhân Viên</h4>
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="maNV"
                        pagination={{ pageSize: 10 }}
                        onRow={(record) => ({
                            onClick: () => handleSelectEmployee(record),
                            onMouseEnter: (e) => {
                                e.currentTarget.style.cursor = "pointer";
                            },
                        })}
                    />
                </div>

                <div className="col-md-5 col-12 mt-md-0 mt-4">
                    <h3 className="mb-3">Chi Tiết Nhân Viên</h3>
                    <div className="infoEmployee-detail">
                        <p><label className="fw-bold">Mã NV</label>
                            <Input value={employee.maNV} onChange={(e) => setEmployee({ ...employee, maNV: e.target.value })} />
                        </p>
                        <p><label className="fw-bold">Tên NV</label>
                            <Input value={employee.tenNV} onChange={(e) => setEmployee({ ...employee, tenNV: e.target.value })} />
                        </p>
                        <p><label className="fw-bold">Giới Tính</label>
                            <Select
                                value={employee.gt}
                                onChange={(value) => setEmployee({ ...employee, gt: value })}
                                style={{ width: "100%" }}
                            >
                                <Select.Option value="Nam">Nam</Select.Option>
                                <Select.Option value="Nữ">Nữ</Select.Option>
                            </Select>
                        </p>
                        <p><label className="fw-bold">Ngày Sinh</label>
                            <DatePicker
                                value={employee.ngaySinh ? dayjs(employee.ngaySinh, "DD/MM/YYYY") : null}
                                onChange={(date) => setEmployee({ ...employee, ngaySinh: date ? date.format("DD/MM/YYYY") : null })}
                                format="DD/MM/YYYY"
                                style={{ width: "100%" }}
                            />
                        </p>
                        <p><label className="fw-bold">Số ĐT</label>
                            <Input value={employee.sdt} onChange={(e) => setEmployee({ ...employee, sdt: e.target.value })} />
                        </p>
                        <p><label className="fw-bold">Lương</label>
                            <Input
                                value={employee.luong}
                                onChange={(e) => setEmployee({ ...employee, luong: parseFloat(e.target.value) || 0 })}
                                addonAfter="VND"
                                type="number"
                            />
                        </p>

                        <div className="button-group mt-3">
                            <Button className="me-2" onClick={handleAddEmployee} type="primary">Thêm</Button>
                            <Button className="me-2" onClick={handleUpdateEmployee} style={{ backgroundColor: "gold", color: "black" }}>Cập nhật</Button>
                            <Button className="me-2" onClick={handleDeleteEmployee} danger>Xóa</Button>
                            <Button onClick={handleClearDataEmployee} style={{ backgroundColor: "gray", color: "white" }}>Xóa thông tin</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmployeeManagement;
