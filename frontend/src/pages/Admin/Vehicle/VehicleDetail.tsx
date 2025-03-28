// src/pages/Admin/Vehicle/VehicleDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Row, Col, Statistic, Tag, Spin, Tabs, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined, CarOutlined, EnvironmentOutlined, DashboardOutlined, ThunderboltOutlined, LineChartOutlined } from '@ant-design/icons';
import vehicleAPI from '@/services/vehicles';
import { Vehicle } from '@/types/vehicle';

const { TabPane } = Tabs;

const VehicleDetail: React.FC = () => {
  const { vin } = useParams<{ vin: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (vin) {
      loadVehicle(vin);
    }
  }, [vin]);
  
  const loadVehicle = async (vinCode: string) => {
    try {
      setLoading(true);
      // 实际项目中应该使用API调用
      // const response = await vehicleAPI.getVehicleById(vinCode);
      // const vehicleData = response.data;
      
      // 使用模拟数据
      const mockData: Vehicle = {
        vin: "LSVAU2180N2183294",
        model: "比亚迪汉EV",
        licensePlate: "京A12345",
        manufacturer: "比亚迪",
        productionYear: 2022,
        batteryCapacity: 76.9,
        maxRange: 605,
        registerDate: "2022-06-15",
        status: "online",
        lastUpdateTime: "2023-07-01T12:30:45Z",
        totalMileage: 12500,
        totalEnergy: 2300,
        totalCarbonReduction: 3750.5,
        carbonCredits: 187.5
      };
      
      setTimeout(() => {
        setVehicle(mockData);
        setLoading(false);
      }, 500);
    } catch (error) {
      message.error('加载车辆数据失败');
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }
  
  if (!vehicle) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          未找到车辆信息
          <div style={{ marginTop: '20px' }}>
            <Button onClick={() => navigate('/admin/vehicles')} icon={<ArrowLeftOutlined />}>
              返回列表
            </Button>
          </div>
        </div>
      </Card>
    );
  }
  
  const statusColors = {
    online: 'success',
    offline: 'default',
    error: 'error'
  };
  
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };
  
  return (
    <div className="vehicle-detail">
      <Card
        title={
          <span>
            <CarOutlined /> 车辆详情: {vehicle.licensePlate} ({vehicle.model})
          </span>
        }
        extra={
          <div>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/admin/vehicles')}
              style={{ marginRight: 8 }}
            >
              返回列表
            </Button>
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={() => navigate(`/admin/vehicles/edit/${vin}`)}
            >
              编辑
            </Button>
          </div>
        }
      >
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Statistic 
              title="总行驶里程" 
              value={vehicle.totalMileage} 
              suffix="km" 
              prefix={<DashboardOutlined />} 
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="总能耗" 
              value={vehicle.totalEnergy} 
              suffix="kWh" 
              prefix={<ThunderboltOutlined />} 
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="碳减排总量" 
              value={vehicle.totalCarbonReduction.toFixed(2)} 
              suffix="kg" 
              prefix={<EnvironmentOutlined />} 
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="碳积分" 
              value={vehicle.carbonCredits.toFixed(2)} 
              prefix={<LineChartOutlined />} 
            />
          </Col>
        </Row>
        
        <Tabs defaultActiveKey="basic">
          <TabPane tab="基本信息" key="basic">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="VIN码">{vehicle.vin}</Descriptions.Item>
              <Descriptions.Item label="车牌号">{vehicle.licensePlate}</Descriptions.Item>
              <Descriptions.Item label="车型">{vehicle.model}</Descriptions.Item>
              <Descriptions.Item label="制造商">{vehicle.manufacturer}</Descriptions.Item>
              <Descriptions.Item label="生产年份">{vehicle.productionYear}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusColors[vehicle.status as keyof typeof statusColors]}>
                  {vehicle.status === 'online' ? '在线' : vehicle.status === 'offline' ? '离线' : '异常'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="电池容量">{vehicle.batteryCapacity} kWh</Descriptions.Item>
              <Descriptions.Item label="最大续航里程">{vehicle.maxRange} km</Descriptions.Item>
              <Descriptions.Item label="注册日期">{vehicle.registerDate}</Descriptions.Item>
              <Descriptions.Item label="最后更新时间">{formatDateTime(vehicle.lastUpdateTime)}</Descriptions.Item>
            </Descriptions>
          </TabPane>
          <TabPane tab="行驶数据" key="driving">
            <div style={{ padding: '20px 0', textAlign: 'center' }}>
              <p>此处显示车辆行驶数据图表</p>
              <p>在实际项目中，可以添加里程、能耗、速度等趋势图</p>
            </div>
          </TabPane>
          <TabPane tab="碳减排数据" key="carbon">
            <div style={{ padding: '20px 0', textAlign: 'center' }}>
              <p>此处显示碳减排数据图表</p>
              <p>在实际项目中，可以添加碳减排量、碳积分等趋势图</p>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default VehicleDetail;
