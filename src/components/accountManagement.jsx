/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef, useState } from "react";
import { Table, Input, Button, Space, Select, Modal, DatePicker, TimePicker, Checkbox } from "antd";
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { axiosCus } from "../axios/axios";
import { URLListAccount, URLUserByID, URLCreateAccount, URLChangePassword, URLDeleteAccount, ChiNhanh, URLUpdateAccount } from "../../URL/url";
import { toast } from "react-toastify";
import dayjs from "dayjs";

function AccountManagement() {
    const [listAccount, setListAccount] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const [idSelected, setIdSelected] = useState('');
    const [accountData, setAccountData] = useState();
    const [isUpdate, setIsUpdate] = useState(false);

    const weekDays = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];
    // Check manv co ton tai ko thi moi dc thay doi hay them vao continue... 
    const [account, setAccount] = useState({
        userName: '',
        password: '',
        avatar: '',
        userType: '',
        activeStatus: 1,
        visibleFunction: '',
        startTime: '00:00:00',
        endTime: '00:00:00',
        workDayofWeek: '0000000',
        activationDate: null,
        deactivationDate: null,
        workShedule: 0,
        activeShedule: 0,
        maNV: '',
        maCN: ChiNhanh,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosCus.get(URLListAccount);
                setListAccount(res.user);
            } catch (error) {
                console.error('Error fetching data:', error);
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
        setSearchText('');
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
                    style={{ marginBottom: 8, display: 'block' }}
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
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const columns = [
        { title: 'User ID', dataIndex: 'userID', key: 'userID', ...getColumnSearchProps('userID') },
        { title: 'User Name', dataIndex: 'userName', key: 'userName', ...getColumnSearchProps('userName') },
        { title: 'User Type', dataIndex: 'userType', key: 'userType', ...getColumnSearchProps('userType') },
        { title: 'Active Status', dataIndex: 'activeStatus', key: 'activeStatus' },
    ];

    const handleUpdateAccount = async () => {
        if (idSelected !== '') {
            try {
                await axiosCus.put(`${URLUpdateAccount}${idSelected}`, account);
                toast.success('Updated account successfully');
                setIsUpdate(!isUpdate);
            } catch (error) {
                console.error('Error updating account:', error);
                toast.error('Update failed');
            }
        } else {
            toast.warn('No account selected for update');
        }
    };

    const handleAddAccount = async () => {
        if (account.userName === '' || account.password === '') {
            toast.warn('Please fill in all required information');
            return;
        }
    
        // Kiểm tra nếu `userName` đã tồn tại trong `listAccount`
        const existingAccount = listAccount.find((acc) => acc.userName === account.userName);
        if (existingAccount) {
            toast.warn('UserName already exists. Please choose a unique UserName.');
            return;
        }
    
        try {
            // Reset `UserID` để SQL tự động tạo ID mới
            const newAccount = { ...account, userID: 0 };
    
            // Gọi API và kiểm tra phản hồi
            const response = await axiosCus.post(URLCreateAccount, newAccount);
    
            // Kiểm tra nếu phản hồi thành công
            if (response.statusCode === 200) {
                toast.success('Added new account successfully');
                setIsUpdate(!isUpdate);
                // Clear form sau khi thêm thành công
                handleClearDataAccount();
            } else {
                toast.error('Add account failed');
            }
        } catch (error) {
            console.error('Error adding account:', error);
            toast.error('Add account failed');
        }
    };              

    const handleDeleteAccount = () => {
        if (idSelected === '') {
            toast.warn('Please select an account to delete');
            return;
        }

        Modal.confirm({
            title: 'Confirm Delete',
            content: 'Are you sure you want to delete this account?',
            okText: 'Confirm',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await axiosCus.delete(`${URLDeleteAccount}${idSelected}`);
                    toast.success('Deleted account successfully');
                    setIsUpdate(!isUpdate);
                } catch (error) {
                    console.error('Error deleting account:', error);
                    toast.error('Delete account failed');
                }
            },
            onCancel() {
                console.log('Cancelled delete');
            }
        });
    };

    const handleClearDataAccount = () => {
        setAccount({
            userName: '',
            password: '',
            avatar: '',
            userType: '',
            activeStatus: 1,
            visibleFunction: '',
            startTime: '00:00:00',
            endTime: '00:00:00',
            workDayofWeek: '0000000',
            activationDate: null,
            deactivationDate: null,
            workShedule: 0,
            activeShedule: 0,
            maNV: '',
            maCN: ChiNhanh,
        });
    };

    const handleWeekDayChange = (checkedValues) => {
        let workDays = '0000000'.split('');
        checkedValues.forEach(dayIndex => {
            workDays[dayIndex] = '1';
        });
        setAccount({ ...account, workDayofWeek: workDays.join('') });
    };

    useEffect(() => {
        if (idSelected) {
            const fetchData = async () => {
                try {
                    const res = await axiosCus.get(`${URLUserByID}${idSelected}`);
                    setAccountData(res.user[0]);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
            fetchData();
        }
    }, [idSelected]);

    useEffect(() => {
        if (accountData) {
            setAccount({
                userName: accountData.userName,
                password: accountData.password,
                avatar: accountData.avatar,
                userType: accountData.userType,
                activeStatus: accountData.activeStatus,
                visibleFunction: accountData.visibleFunction.trim(),
                startTime: accountData.startTime,
                endTime: accountData.endTime,
                workDayofWeek: accountData.workDayofWeek,
                activationDate: dayjs(accountData.activationDate),
                deactivationDate: dayjs(accountData.deactivationDate),
                workShedule: accountData.workShedule,
                activeShedule: accountData.activeShedule,
                maNV: accountData.maNV,
                maCN: accountData.maCN,
            });
        }
    }, [accountData]);

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-8">
                    <h4 className="mb-3">Account List</h4>
                    <Table
                        className="table-account"
                        columns={columns}
                        dataSource={listAccount}
                        rowKey="userID"
                        pagination={{ pageSize: 10 }}
                        onRow={(record) => ({
                            onClick: () => {
                                setIdSelected(record.userID);
                            },
                            onMouseEnter: (e) => {
                                e.currentTarget.style.cursor = 'pointer';
                            },
                        })}
                    />
                </div>
    
                <div className="col-md-4">
                    <h3 className="mb-3">Chi tiết tài khoản</h3>
                    <div className="infoAccount-detail">
                        <p><label className="fw-bold">Tên tài khoản</label>
                            <Input value={account.userName} onChange={e => setAccount({ ...account, userName: e.target.value })} />
                        </p>
                        <p><label className="fw-bold">Mật khẩu</label>
                            <Input.Password value={account.password} onChange={e => setAccount({ ...account, password: e.target.value })} />
                        </p>
                        
                        {/* Trạng thái hoạt động */}
                        <p><label className="fw-bold">Trạng thái hoạt động</label>
                            <Select
                                value={account.activeStatus}
                                onChange={(value) => setAccount({ ...account, activeStatus: value })}
                            >
                                <Select.Option value={1}>Hoạt động</Select.Option>
                                <Select.Option value={0}>Không hoạt động</Select.Option>
                            </Select>
                        </p>
                        
                        {/* Chỉ hiển thị các trường khác khi activeStatus là 1 */}
                        {account.activeStatus === 1 && (
                            <>
                                <p><label className="fw-bold">Ảnh đại diện</label>
                                    <Input value={account.avatar} onChange={e => setAccount({ ...account, avatar: e.target.value })} />
                                </p>
                                <p><label className="fw-bold">Loại tài khoản</label>
                                    <Select value={account.userType} onChange={(value) => setAccount({ ...account, userType: value })}>
                                        <Select.Option value="Admin">Admin</Select.Option>
                                        <Select.Option value="User">Dược sĩ</Select.Option>
                                    </Select>
                                </p>
                                <p><label className="fw-bold">Quyền chức năng</label>
                                    <Input value={account.visibleFunction} onChange={e => setAccount({ ...account, visibleFunction: e.target.value })} />
                                </p>
        
                                {/* Work Schedule */}
                                <p><label className="fw-bold">Lịch làm việc</label>
                                    <Select 
                                        value={account.workShedule} 
                                        onChange={(value) => setAccount({ ...account, workShedule: value })}
                                    >
                                        <Select.Option value={0}>Inactive</Select.Option>
                                        <Select.Option value={1}>Active</Select.Option>
                                    </Select>
                                </p>
        
                                {/* Chỉ hiển thị khi WorkShedule là 1 */}
                                {account.workShedule === 1 && (
                                    <>
                                        <p><label className="fw-bold">Thời gian bắt đầu</label>
                                            <TimePicker 
                                                value={account.startTime ? dayjs(account.startTime, 'HH:mm:ss') : null} 
                                                onChange={(time) => setAccount({ ...account, startTime: time ? time.format('HH:mm:ss') : '' })} 
                                                format="HH:mm:ss" 
                                            />
                                        </p>
                                        <p><label className="fw-bold">Thời gian kết thúc</label>
                                            <TimePicker 
                                                value={account.endTime ? dayjs(account.endTime, 'HH:mm:ss') : null} 
                                                onChange={(time) => setAccount({ ...account, endTime: time ? time.format('HH:mm:ss') : '' })} 
                                                format="HH:mm:ss" 
                                            />
                                        </p>
                                        <p><label className="fw-bold">Ngày làm việc trong tuần</label></p>
                                        <Checkbox.Group
                                            options={weekDays.map((day, index) => ({ label: day, value: index }))}
                                            onChange={handleWeekDayChange}
                                            value={[...account.workDayofWeek].map((day, index) => day === '1' ? index : null).filter(val => val !== null)}
                                        />
                                        <p>Chuỗi ngày làm việc: {account.workDayofWeek}</p>
                                    </>
                                )}
        
                                {/* Active Schedule */}
                                <p><label className="fw-bold">Kích hoạt lịch</label>
                                    <Select 
                                        value={account.activeShedule} 
                                        onChange={(value) => setAccount({ ...account, activeShedule: value })}
                                    >
                                        <Select.Option value={0}>Inactive</Select.Option>
                                        <Select.Option value={1}>Active</Select.Option>
                                    </Select>
                                </p>
        
                                {/* Chỉ hiển thị khi ActiveShedule là 1 */}
                                {account.activeShedule === 1 && (
                                    <>
                                        <p><label className="fw-bold">Ngày kích hoạt tài khoản</label>
                                            <DatePicker value={account.activationDate} onChange={(date) => setAccount({ ...account, activationDate: date })} />
                                        </p>
                                        <p><label className="fw-bold">Ngày hết hạn tài khoản</label>
                                            <DatePicker value={account.deactivationDate} onChange={(date) => setAccount({ ...account, deactivationDate: date })} />
                                        </p>
                                    </>
                                )}
        
                                <p><label className="fw-bold">Mã nhân viên</label>
                                    <Input value={account.maNV} onChange={e => setAccount({ ...account, maNV: e.target.value })} />
                                </p>
                            </>
                        )}
    
                        <div className="button-group mt-3">
                            <Button onClick={handleAddAccount} type="primary">Add</Button>
                            <Button onClick={handleUpdateAccount} style={{ backgroundColor: 'gold', color: 'black' }}>Update</Button>
                            <Button onClick={handleDeleteAccount} danger>Delete</Button>
                            <Button onClick={handleClearDataAccount} style={{ backgroundColor: 'gray', color: 'white' }}>Clear</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AccountManagement;
