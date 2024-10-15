import { Button, Flex, Layout } from 'antd';
import './App.css';
import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/sidebar';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import CusHeader from './components/cusHeader';
import Dashboard from './components/dashboard';  // Component cho route Dashboard
import MedicineManagement from './components/medicineManagement';  // Component cho route Medicine
import AccountManagement from './components/accountManagement';  // Component cho route Accounts
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const { Sider, Header, Content } = Layout;

  return (
      <Layout>
        <Sider className='sider' theme='light' trigger={null} collapsible collapsed={collapsed}>
          <Sidebar />
        </Sider>

        <Button 
          type='text' 
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
          onClick={() => setCollapsed(!collapsed)}
          className='trigger-btn'
        />
        <Layout>
          <Header className='header'>
            <CusHeader />
          </Header>

          {/* Phần Content sẽ thay đổi theo route */}
          <Content className='content'>
            <Flex>
              <Routes>
                <Route path="/" element={<Dashboard />} /> {/* Mặc định là Dashboard */}
                <Route path="/medicineManagement" element={<MedicineManagement />} />
                <Route path="/accountManagement" element={<AccountManagement />} />
              </Routes>
            </Flex>
          </Content>
        </Layout>
        <ToastContainer />
      </Layout>
  );
}

export default App;
