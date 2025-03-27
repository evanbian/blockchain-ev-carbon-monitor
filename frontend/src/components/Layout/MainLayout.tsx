// src/components/Layout/MainLayout.tsx
import React, { ReactNode } from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  BarChartOutlined,
  SettingOutlined,
  CarOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="header" style={{ padding: 0, background: '#fff', display: 'flex', alignItems: 'center' }}>
        <div style={{ marginLeft: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '18px' }}>新能源车辆碳减排计量系统</h1>
        </div>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={[
              {
                key: '/',
                icon: <DashboardOutlined />,
                label: <Link to="/">首页</Link>,
              },
              {
                key: '/admin',
                icon: <SettingOutlined />,
                label: <Link to="/admin">管理平台</Link>,
              },
              {
                key: '/analysis',
                icon: <BarChartOutlined />,
                label: <Link to="/analysis">分析平台</Link>,
              },
              {
                key: '/display',
                icon: <CarOutlined />,
                label: <Link to="/display">展示平台</Link>,
              },
            ]}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              background: '#fff',
              minHeight: 280,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
