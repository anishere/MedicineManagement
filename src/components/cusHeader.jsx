/* eslint-disable react-hooks/rules-of-hooks */
// eslint-disable-next-line no-unused-vars
import { CarryOutOutlined, LogoutOutlined, NotificationOutlined, SyncOutlined } from "@ant-design/icons";
import { Avatar, Flex, Typography, Space, Modal } from "antd";
import { useEffect, useState } from "react";
import { axiosCus } from "../axios/axios";
import { URLEmployeID, URLUserByID } from "../../URL/url";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";

function cusHeader() {
    const [accountInfo, setAccountInfo] = useState();
    const [employeeInfo, setEmployeeInfo] = useState();
    const [currentDateTime, setCurrentDateTime] = useState(dayjs().format("YYYY-MM-DD HH:mm:ss"));
    const [weatherInfo, setWeatherInfo] = useState(null);

    // Thành phố mặc định
    const defaultCity = localStorage.getItem("city") || "Cần Thơ";

    const handleReload = () => {
        window.location.href = "/";
    };

    const handleLogout = () => {
        Modal.confirm({
            title: "Xác nhận đăng xuất",
            content: "Bạn có chắc chắn muốn đăng xuất?",
            okText: "Đăng xuất",
            cancelText: "Hủy",
            onOk: () => {
                localStorage.clear();
                window.location.href = "/";
            },
            onCancel: () => {
                console.log("Hủy đăng xuất");
            },
            centered: true,
        });
    };

    const fetchWeather = async (city) => {
        try {
            const apiKey = "65addcf3f4525331894797e5b8338a31";
            const geoResponse = await axios.get(
                `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
            );
            const location = geoResponse.data[0];
            const { lat, lon } = location;

            const weatherResponse = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
            );
            const weatherData = weatherResponse.data;

            setWeatherInfo({
                city: city,
                temperature: weatherData.main.temp,
                windspeed: weatherData.wind.speed,
            });
        } catch (error) {
            console.error("Error fetching weather data:", error);
        }
    };

    useEffect(() => {
        const fetchEmployees = async () => {
            const userID = localStorage.getItem("userID");
            const maNV = localStorage.getItem("maNV");

            try {
                const response = await axiosCus.get(`${URLUserByID}${userID}`);
                setAccountInfo(response.user[0]);

                const res = await axiosCus.get(`${URLEmployeID}${maNV}`);
                setEmployeeInfo(res.listNhanVien[0]);
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };

        fetchEmployees();
        fetchWeather(defaultCity);

        const timer = setInterval(() => {
            setCurrentDateTime(dayjs().format("YYYY-MM-DD HH:mm:ss"));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <>
            <Flex align="center" justify="space-between">
                {/* Tiêu đề */}
                <Typography.Title 
                    level={4} 
                    type="secondary" 
                    className="welcome-title text-white"
                >
                    Xin chào {accountInfo && accountInfo.userType} {employeeInfo && employeeInfo.tenNV}!
                </Typography.Title>
    
                {/* Thông tin ngày giờ và thời tiết */}
                <Flex align="center" justify="space-between" style={{ width: "60%" }}>
                    {/* Ngày giờ */}
                    <div className="badge bg-light text-dark p-2 rounded hide-onMobi">
                        <Typography.Text type="secondary">
                            {currentDateTime}
                        </Typography.Text>
                    </div>
    
                    {/* Thời tiết */}
                    {weatherInfo ? (
                        <div className="badge bg-info text-white p-2 rounded hide-onMobi mx-2">
                            <Typography.Text type="secondary">
                                Thành phố: {weatherInfo.city} | Nhiệt độ: {weatherInfo.temperature}°C | Gió: {weatherInfo.windspeed} km/h
                            </Typography.Text>
                        </div>
                    ) : (
                        <div className="badge bg-warning text-dark p-2 rounded hide-onMobi mx-2">
                            <Typography.Text type="secondary">Đang tải thời tiết...</Typography.Text>
                        </div>
                    )}
    
                    {/* Nút điều khiển */}
                    <Space size="large" style={{ flex: 1, justifyContent: "end" }}>
                        <Flex align="center" gap="10px">
                            <i onClick={handleReload} className="fs-4 header-reload">
                                <SyncOutlined />
                            </i>
                            <Link to="/notePersonal">
                                <CarryOutOutlined className="header-icon" />
                            </Link>
                            <Link onClick={handleLogout}>
                                <LogoutOutlined className="header-icon" />
                            </Link>
                            <Link to="/personal">
                                <Avatar
                                    src={accountInfo && accountInfo.avatar}
                                    alt="User Avatar"
                                    style={{ border: "2px solid #1890ff", cursor: "pointer" }}
                                />
                            </Link>
                        </Flex>
                    </Space>
                </Flex>
            </Flex>
        </>
    );    
}

export default cusHeader;
