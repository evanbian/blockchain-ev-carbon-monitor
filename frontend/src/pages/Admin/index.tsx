// src/pages/Admin/index.tsx
import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Button } from 'antd';
import { CarOutlined, SettingOutlined, PlusOutlined } from '@ant-design/icons';
import VehicleRouter from './Vehicle';
import SettingsPage from './Settings';

// 管理平台首页
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div>
      <h2>管理平台</h2>
      <p>欢迎使用新能源车辆碳减排计量系统管理平台</p>
      
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={8}>
          <Card
            actions={[
              <Button 
                type="link" 
                onClick={() => navigate('/admin/vehicles')}
              >
                查看车辆
              </Button>,
              <Button 
                type="link" 
                onClick={() => navigate('/admin/vehicles/add')}
                icon={<PlusOutlined />}
              >
                添加车辆
              </Button>
            ]}
          >
            <Statistic
              title="注册车辆总数"
              value={3}
              prefix={<CarOutlined />}
              suffix="辆"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="车辆在线率"
              value={66.7}
              precision={1}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            actions={[
              <Button 
                type="link" 
                onClick={() => navigate('/admin/settings')}
              >
                查看配置
              </Button>
            ]}
          >
            <Statistic
              title="系统参数"
              value={8}
              prefix={<SettingOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// 管理平台路由
const AdminPage: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/vehicles/*" element={<VehicleRouter />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminPage;
