/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Bounce, toast } from 'react-toastify';

dayjs.extend(utc);
dayjs.extend(timezone);

function Setting() {
    const [selectedTimezone, setSelectedTimezone] = useState('Asia/Ho_Chi_Minh'); // Mặc định múi giờ Việt Nam
    const [selectedCity, setSelectedCity] = useState('Cần Thơ'); // Mặc định thành phố Cần Thơ

    // Cài đặt hiển thị
    const [displaySettings, setDisplaySettings] = useState({
        showName: true,
        showDateTime: true,
        showTemperature: true,
        showAnimation: true,
    });

    const timeZones = [
        { label: 'UTC', value: 'UTC' },
        { label: 'GMT', value: 'GMT' },
        { label: 'Eastern Time', value: 'America/New_York' },
        { label: 'British Time', value: 'Europe/London' },
        { label: 'Japan Time', value: 'Asia/Tokyo' },
        { label: 'Vietnam Time', value: 'Asia/Ho_Chi_Minh' },
        { label: 'China Time', value: 'Asia/Shanghai' },
        { label: 'Australia Time', value: 'Australia/Sydney' },
    ];

    const vietnamCities = [
        'Cần Thơ',
        'Hà Nội',
        'Hồ Chí Minh',
        'Đà Nẵng',
        'Hải Phòng',
        'Nha Trang',
        'Vũng Tàu',
        'Huế',
        'Quy Nhơn',
        'Phú Quốc',
        'Sóc Trăng',
    ];

    const getTimeZonesWithOffset = () => {
        return timeZones.map((zone) => {
            const offset = dayjs().tz(zone.value).utcOffset() / 60; // Lấy độ lệch UTC tính theo giờ
            const sign = offset >= 0 ? '+' : '-';
            return {
                ...zone,
                offset: `UTC${sign}${Math.abs(offset)}`, // Ví dụ: UTC+7
            };
        });
    };

    const timeZonesWithOffset = getTimeZonesWithOffset();

    useEffect(() => {
        // Lấy dữ liệu đã lưu trong localStorage
        const savedTimezone = localStorage.getItem('userTimezone');
        const savedCity = localStorage.getItem('userCity');
        const savedDisplaySettings = JSON.parse(localStorage.getItem('displaySettings'));

        if (savedTimezone) {
            setSelectedTimezone(savedTimezone);
        }
        if (savedCity) {
            setSelectedCity(savedCity);
        }
        if (savedDisplaySettings) {
            setDisplaySettings(savedDisplaySettings);
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('userTimezone', selectedTimezone);
        localStorage.setItem('userCity', selectedCity);
        localStorage.setItem('displaySettings', JSON.stringify(displaySettings));

        toast.success('Các cài đặt đã được lưu vui lòng reload lại', {
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
    };

    const handleToggleDisplaySetting = (setting) => {
        setDisplaySettings((prevSettings) => ({
            ...prevSettings,
            [setting]: !prevSettings[setting],
        }));
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Cài đặt</h1>

            {/* Chọn múi giờ */}
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="timezone-select" style={{ marginRight: '10px' }}>
                    Chọn múi giờ:
                </label>
                <select
                    id="timezone-select"
                    value={selectedTimezone}
                    onChange={(e) => setSelectedTimezone(e.target.value)}
                    className="form-select"
                    style={{ width: '300px', display: 'inline-block' }}
                >
                    {timeZonesWithOffset.map((zone) => (
                        <option key={zone.value} value={zone.value}>
                            {zone.offset} ({zone.label})
                        </option>
                    ))}
                </select>
            </div>

            {/* Chọn thành phố */}
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="city-select" style={{ marginRight: '10px' }}>
                    Chọn thành phố:
                </label>
                <select
                    id="city-select"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="form-select"
                    style={{ width: '300px', display: 'inline-block' }}
                >
                    {vietnamCities.map((city) => (
                        <option key={city} value={city}>
                            {city}
                        </option>
                    ))}
                </select>
            </div>

            {/* Cài đặt hiển thị */}
            <div style={{ marginBottom: '20px' }}>
                <h3>Cài đặt hiển thị:</h3>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={displaySettings.showName}
                            onChange={() => handleToggleDisplaySetting('showName')}
                        />
                        Hiển thị tên
                    </label>
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={displaySettings.showDateTime}
                            onChange={() => handleToggleDisplaySetting('showDateTime')}
                        />
                        Hiển ngày giờ
                    </label>
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={displaySettings.showTemperature}
                            onChange={() => handleToggleDisplaySetting('showTemperature')}
                        />
                        Hiển thị nhiệt độ
                    </label>
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={displaySettings.showAnimation}
                            onChange={() => handleToggleDisplaySetting('showAnimation')}
                        />
                        Hiển thị animation
                    </label>
                </div>
            </div>

            <button onClick={handleSave} className="btn btn-primary">
                Lưu cài đặt
            </button>
        </div>
    );
}

export default Setting;
