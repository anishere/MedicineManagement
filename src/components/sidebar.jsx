/* eslint-disable react-hooks/rules-of-hooks */
import { ProfileOutlined, LoginOutlined, CarryOutOutlined, SettingOutlined, FormOutlined, UserSwitchOutlined, UsergroupAddOutlined, ContainerOutlined, BarChartOutlined } from "@ant-design/icons";
import { Flex, Menu, Modal } from "antd";
import { Link } from "react-router-dom"; // Import Link
import logo from '../assets/imgStore/logo.jpg'

const { SubMenu } = Menu; // Sử dụng SubMenu từ Menu

function Sidebar() {

    const handleLogout = () => {
        Modal.confirm({
            title: "Xác nhận đăng xuất",
            content: "Bạn có chắc chắn muốn đăng xuất?",
            okText: "Đăng xuất",
            cancelText: "Hủy",
            onOk: () => {
                // Xóa toàn bộ local storage
                localStorage.clear();
                window.location.href = "/";
            },
            onCancel: () => {
                console.log("Hủy đăng xuất");
            },
            centered: true,
        });
    };

    return (
        <>
            <Flex align="center" justify="center">
                <div className="logo">
                    <img 
                        src={logo}
                        alt="Pharmacist Logo" 
                        style={{ width: "70px", height: "auto" }}
                    />
                </div>
            </Flex>

            <Menu mode='inline' defaultSelectedKeys={['1']} className="menu-bar">
                <Menu.Item key='1' icon={<BarChartOutlined />}>
                    <Link to='/'>Dashboard</Link> {/* Điều hướng đến "/" */}
                </Menu.Item>

                {/* Tạo Menu con cho Quản lý thuốc */}
                <SubMenu key='sub1' icon={<FormOutlined />} title="Quản lý thuốc">
                    <Menu.Item key='2-1'>
                        <Link to='/medicineManagement'>Danh sách thuốc</Link> {/* Điều hướng đến trang Quản lý thuốc */}
                    </Menu.Item>
                    <Menu.Item key='2-2'>
                        <Link to='/sellMedicine'>Bán thuốc</Link> {/* Điều hướng đến trang Bán thuốc */}
                    </Menu.Item>
                    <Menu.Item key='2-3'>
                        <Link to='/invoices'>Danh sách hóa đơn</Link> {/* Điều hướng đến trang Thêm thuốc */}
                    </Menu.Item>
                    <Menu.Item key='2-4'>
                        <Link to='/categoryManagement'>Danh mục thuốc</Link> {/* Điều hướng đến trang Thêm thuốc */}
                    </Menu.Item>
                </SubMenu>

                <Menu.Item key='3' icon={<UsergroupAddOutlined />}>
                    <Link to='/customerManagement'>Quản lý khách hàng</Link>
                </Menu.Item>

                {/* Tạo Menu con cho Quản lý thuốc */}
                <SubMenu key='sub2' icon={<UserSwitchOutlined />} title="Quản lý nhân sự">
                    <Menu.Item key='4-1' >
                        <Link to='/employeeManagement'>Quản lý nhân viên</Link> {/* Điều hướng đến "/accounts" */}
                    </Menu.Item>
                    <Menu.Item key='4-2'>
                        <Link to='/accountManagement'>Quản lý tài khoản</Link> {/* Điều hướng đến trang Bán thuốc */}
                    </Menu.Item>
                </SubMenu>

                <SubMenu key='sub3' icon={<ContainerOutlined />} title="Q.lý nhập hàng">
                    <Menu.Item key='5-1' >
                        <Link to='/supplierManagement'>Nhà cung cấp</Link> {/* Điều hướng đến "/accounts" */}
                    </Menu.Item>
                    <Menu.Item key='5-2' >
                        <Link to='/importManagement'>D.sách nhập hàng</Link> {/* Điều hướng đến "/accounts" */}
                    </Menu.Item>
                </SubMenu>

                <Menu.Item key='6' icon={<CarryOutOutlined />}>
                    <Link to='/notePersonal'>Ghi chú</Link> {/* Điều hướng đến "/notes" */}
                </Menu.Item>

                <Menu.Item key='7' icon={<ProfileOutlined />}>
                    <Link to='/personal'>Cá nhân</Link> {/* Điều hướng đến "/profile" */}
                </Menu.Item>

                <Menu.Item key='8' icon={<SettingOutlined />}>
                    <Link to='/settings'>Cài đặt</Link> {/* Điều hướng đến "/settings" */}
                </Menu.Item>

                <Menu.Item key='9' icon={<LoginOutlined />}>
                    <Link onClick={handleLogout} to=''>Thoát</Link> {/* Điều hướng đến "/logout" */}
                </Menu.Item>
            </Menu>
        </>
    );
}

export default Sidebar;
