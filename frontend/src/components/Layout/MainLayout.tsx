// src/components/Layout/MainLayout.tsx
import React, { ReactNode, useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  BarChartOutlined,
  SettingOutlined,
  CarOutlined,
  DatabaseOutlined,
  LineChartOutlined,
  AppstoreOutlined,
  UserOutlined,
  BellOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { SubMenu } = Menu;

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  
  // 初始化菜单状态
  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    
    // 设置展开的子菜单
    if (pathParts.length > 0) {
      setOpenKeys([`/${pathParts[0]}`]);
    }
    
    // 设置选中的菜单项
    if (location.pathname === '/') {
      setSelectedKeys(['/']);
    } else if (pathParts.length === 1) {
      setSelectedKeys([`/${pathParts[0]}`]);
    } else if (pathParts.length >= 2) {
      if (pathParts[1] === 'vehicles') {
        setSelectedKeys([`/${pathParts[0]}/vehicles`]);
      } else {
        setSelectedKeys([`/${pathParts[0]}`]);
      }
    }
  }, [location.pathname]);
  
  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="header" style={{ padding: 0, background: '#fff', display: 'flex', alignItems: 'center' }}>
        <div style={{ marginLeft: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '18px' }}>新能源车辆碳减排计量系统</h1>
        </div>
        <div style={{ marginLeft: 'auto', marginRight: '24px' }}>
          <UserOutlined style={{ fontSize: '16px', marginRight: '8px' }} />
          <span>管理员</span>
        </div>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={handleOpenChange}
            style={{ height: '100%', borderRight: 0 }}
            items={[
              {
                key: "/",
                icon: <DashboardOutlined />,
                label: <Link to="/">首页</Link>
              },
              {
                key: "/admin",
                icon: <SettingOutlined />,
                label: "管理平台",
                children: [
                  {
                    key: "/admin/vehicles",
                    icon: <CarOutlined />,
                    label: <Link to="/admin/vehicles">车辆管理</Link>
                  },
                  {
                    key: "/admin/settings",
                    icon: <AppstoreOutlined />,
                    label: <Link to="/admin/settings">系统配置</Link>
                  }
                ]
              },
              {
                key: "/analysis",
                icon: <BarChartOutlined />,
                label: "分析平台",
                children: [
                  {
                    key: "/analysis/carbon",
                    icon: <LineChartOutlined />,
                    label: <Link to="/analysis/carbon">碳减排分析</Link>
                  },
                  {
                    key: "/analysis/alerts",
                    icon: <BellOutlined />, // 请确保导入 BellOutlined
                    label: <Link to="/analysis/alerts">异常监控</Link>
                  },               
                  {
                    key: "/analysis/vehicle",
                    icon: <CarOutlined />,
                    label: <Link to="/analysis/vehicle">车辆分析</Link>
                  },
                  {
                    key: "/analysis/prediction",
                    icon: <LineChartOutlined />,
                    label: <Link to="/analysis/prediction">预测分析</Link>
                  }
                ]
              },
              {
                key: "/display",
                icon: <DatabaseOutlined />,
                label: "展示平台",
                children: [
                  {
                    key: "/display/overview",
                    icon: <DashboardOutlined />,
                    label: <Link to="/display/overview">总览</Link>
                  },
                  {
                    key: "/display/explorer",
                    icon: <DatabaseOutlined />,
                    label: <Link to="/display/explorer">区块链浏览器</Link>
                  }
                ]
              }
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
