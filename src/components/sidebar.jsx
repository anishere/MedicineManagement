/* eslint-disable react-hooks/rules-of-hooks */
import { UserOutlined, ProfileOutlined, LoginOutlined, CarryOutOutlined, SettingOutlined, FormOutlined, UserSwitchOutlined } from "@ant-design/icons";
import { Flex, Menu } from "antd";
import { FaUserDoctor } from "react-icons/fa6";
import { Link } from "react-router-dom"; // Import Link

function Sidebar() {
    return (
        <>
            <Flex align="center" justify="center">
                <div className="logo">
                    <FaUserDoctor />
                </div>
            </Flex>

            <Menu mode='inline' defaultSelectedKeys={['1']} className="menu-bar">
                <Menu.Item key='1' icon={<UserOutlined />}>
                    <Link to='/'>Dashboard</Link> {/* Điều hướng đến "/" */}
                </Menu.Item>

                <Menu.Item key='2' icon={<FormOutlined />}>
                    <Link to='/medicineManagement'>Quản lý thuốc</Link> {/* Điều hướng đến "/medicine" */}
                </Menu.Item>

                <Menu.Item key='3' icon={<UserSwitchOutlined />}>
                    <Link to='/accountManagement'>Quản lý tài khoản</Link> {/* Điều hướng đến "/accounts" */}
                </Menu.Item>

                <Menu.Item key='4' icon={<CarryOutOutlined />}>
                    <Link to='/notes'>Ghi chú</Link> {/* Điều hướng đến "/notes" */}
                </Menu.Item>

                <Menu.Item key='5' icon={<ProfileOutlined />}>
                    <Link to='/profile'>Cá nhân</Link> {/* Điều hướng đến "/profile" */}
                </Menu.Item>

                <Menu.Item key='6' icon={<SettingOutlined />}>
                    <Link to='/settings'>Cài đặt</Link> {/* Điều hướng đến "/settings" */}
                </Menu.Item>

                <Menu.Item key='7' icon={<LoginOutlined />}>
                    <Link to='/logout'>Thoát</Link> {/* Điều hướng đến "/logout" */}
                </Menu.Item>
            </Menu>
        </>
    );
}

export default Sidebar;
