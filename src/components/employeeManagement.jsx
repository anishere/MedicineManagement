/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Table, Input, Button, Modal, DatePicker, Select } from "antd";
import { axiosCus } from "../axios/axios";
import {
    URLListEmployee,
    URLEmployeID,
    URLAddEmployee,
    URLUpdate,
    URLDeleteEmployee,
    ChiNhanh,
} from "../../URL/url";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

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

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await axiosCus.get(URLListEmployee);
                const formattedData = response.listNhanVien.map((employee) => ({
                    ...employee,
                    ngaySinh: dayjs(employee.ngaySinh).format("YYYY-MM-DD"),
                }));
                setListNhanVien(formattedData);
                setFilteredData(formattedData);
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };
        fetchEmployees();
    }, [isUpdate]);

    const handleAddEmployee = async () => {
        if (!employee.tenNV || !employee.sdt) {
            toast.warn("Vui lòng điền đủ thông tin.");
            return;
        }
        try {
            const formattedEmployee = {
                ...employee,
                ngaySinh: employee.ngaySinh
                    ? dayjs(employee.ngaySinh).format("YYYY-MM-DD")
                    : null,
            };
            await axiosCus.post(URLAddEmployee, formattedEmployee);
            toast.success("Thêm nhân viên thành công!");
            setIsUpdate(!isUpdate);
            handleClearDataEmployee();
        } catch (error) {
            console.error("Error adding employee:", error);
            toast.error("Không thể thêm nhân viên.");
        }
    };

    const handleUpdateEmployee = async () => {
        if (!employee.maNV) {
            toast.warn("Mã nhân viên không hợp lệ hoặc chưa được nhập.");
            return;
        }
        const employeeExists = listNhanVien.some((nv) => nv.maNV === employee.maNV);
        if (!employeeExists) {
            toast.warn("Mã nhân viên không tồn tại trong hệ thống.");
            return;
        }
        try {
            const formattedEmployee = {
                ...employee,
                ngaySinh: employee.ngaySinh
                    ? dayjs(employee.ngaySinh).format("YYYY-MM-DD")
                    : null,
            };
            await axiosCus.put(`${URLUpdate}${employee.maNV}`, formattedEmployee);
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
                    await axiosCus.delete(`${URLDeleteEmployee}${employee.maNV}`);
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
            const { maNV, tenNV, gt, ngaySinh, sdt, luong, maCN } =
                response.listNhanVien[0];
            setEmployee({
                maNV,
                tenNV,
                gt,
                ngaySinh: dayjs(ngaySinh).format("YYYY-MM-DD"),
                sdt,
                luong,
                maCN,
            });
        } catch (error) {
            console.error("Error fetching employee data:", error);
        }
    };

    const columns = [
        { title: "Mã NV", dataIndex: "maNV", key: "maNV" },
        { title: "Tên NV", dataIndex: "tenNV", key: "tenNV" },
        { title: "Giới Tính", dataIndex: "gt", key: "gt" },
        { title: "SĐT", dataIndex: "sdt", key: "sdt" },
        { title: "Ngày Sinh", dataIndex: "ngaySinh", key: "ngaySinh" },
        { title: "Lương", dataIndex: "luong", key: "luong" },
    ];

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-md-7">
                    <h4 className="mb-4">Danh Sách Nhân Viên</h4>
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="maNV"
                        onRow={(record) => ({
                            onClick: () => handleSelectEmployee(record),
                        })}
                        pagination={{ pageSize: 5 }}
                    />
                </div>
                <div className="col-md-5">
                    <h4 className="mb-4">Chi Tiết Nhân Viên</h4>
                    <Input
                        className="mb-3"
                        placeholder="Mã NV"
                        value={employee.maNV}
                        onChange={(e) =>
                            setEmployee({ ...employee, maNV: e.target.value })
                        }
                    />
                    <Input
                        className="mb-3"
                        placeholder="Tên NV"
                        value={employee.tenNV}
                        onChange={(e) =>
                            setEmployee({ ...employee, tenNV: e.target.value })
                        }
                    />
                    <Select
                        className="mb-3"
                        value={employee.gt}
                        onChange={(value) => setEmployee({ ...employee, gt: value })}
                        style={{ width: "100%" }}
                    >
                        <Select.Option value="Nam">Nam</Select.Option>
                        <Select.Option value="Nữ">Nữ</Select.Option>
                    </Select>
                    <DatePicker
                        className="mb-3"
                        placeholder="Ngày Sinh"
                        value={
                            employee.ngaySinh ? dayjs(employee.ngaySinh) : null
                        }
                        onChange={(date) =>
                            setEmployee({
                                ...employee,
                                ngaySinh: date ? date.format("YYYY-MM-DD") : null,
                            })
                        }
                        format="YYYY-MM-DD"
                        style={{ width: "100%" }}
                    />
                    <Input
                        className="mb-3"
                        placeholder="SĐT"
                        value={employee.sdt}
                        onChange={(e) =>
                            setEmployee({ ...employee, sdt: e.target.value })
                        }
                    />
                    <Input
                        className="mb-3"
                        placeholder="Lương"
                        type="number"
                        value={employee.luong}
                        onChange={(e) =>
                            setEmployee({
                                ...employee,
                                luong: parseFloat(e.target.value) || 0,
                            })
                        }
                    />
                    <div className="d-flex gap-2">
                        <Button type="primary" onClick={handleAddEmployee}>
                            Thêm
                        </Button>
                        <Button type="default" onClick={handleUpdateEmployee}>
                            Cập nhật
                        </Button>
                        <Button className="me-2" onClick={handleDeleteEmployee} danger>Xóa</Button>
                        <Button onClick={handleClearDataEmployee} style={{ backgroundColor: "gray", color: "white" }}>Xóa thông tin</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmployeeManagement;
