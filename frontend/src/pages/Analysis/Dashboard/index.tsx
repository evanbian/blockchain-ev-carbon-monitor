// src/pages/Analysis/Dashboard/index.tsx
import React from 'react';
import { Card, Row, Col, Statistic, Button, Divider } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, CarOutlined, ThunderboltOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const AnalysisDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // 这里将来会从API获取数据
  const mockData = {
    totalReduction: 12584.2,
    currentMonthReduction: 958.3,
    previousMonthReduction: 892.7,
    vehicleCount: 3,
    averageMonthlyReduction: 358.4,
    totalMileage: 37500,
    totalEnergy: 6900,
    comparedToFuel: 18876.3
  };
  
  const monthChange = ((mockData.currentMonthReduction - mockData.previousMonthReduction) / mockData.previousMonthReduction) * 100;
  
  return (
    <div className="analysis-dashboard">
      <h2>分析平台</h2>
      <p>碳减排数据分析和趋势展示</p>
      
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="碳减排总量"
              value={mockData.totalReduction}
              precision={1}
              valueStyle={{ color: '#3f8600' }}
              suffix="kg"
            />
            <div style={{ marginTop: 10 }}>
              <Button type="primary" onClick={() => navigate('/analysis/carbon')}>
                查看详情
              </Button>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="本月碳减排"
              value={mockData.currentMonthReduction}
              precision={1}
              valueStyle={{ color: monthChange >= 0 ? '#3f8600' : '#cf1322' }}
              prefix={monthChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix="kg"
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 5 }}>
              {monthChange >= 0 ? '增长' : '下降'} {Math.abs(monthChange).toFixed(1)}% 
              相比上月 ({mockData.previousMonthReduction.toFixed(1)} kg)
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="车辆数量"
              value={mockData.vehicleCount}
              valueStyle={{ color: '#1890ff' }}
              prefix={<CarOutlined />}
              suffix="辆"
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 5 }}>
              平均每月减排 {mockData.averageMonthlyReduction.toFixed(1)} kg/辆
            </div>
          </Card>
        </Col>
      </Row>
      
      <Divider orientation="left">环境效益</Divider>
      
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic
              title="行驶里程"
              value={mockData.totalMileage}
              valueStyle={{ color: '#722ed1' }}
              suffix="km"
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="能源消耗"
              value={mockData.totalEnergy}
              valueStyle={{ color: '#fa8c16' }}
              suffix="kWh"
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="相当于减少燃油消耗"
              value={mockData.comparedToFuel}
              precision={1}
              valueStyle={{ color: '#52c41a' }}
              suffix="L"
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      <Divider orientation="left">快速访问</Divider>
      
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Button type="primary" block onClick={() => navigate('/analysis/carbon')}>
            碳减排分析
          </Button>
        </Col>
        <Col span={8}>
          <Button type="default" block onClick={() => navigate('/analysis/vehicle')}>
            车辆分析
          </Button>
        </Col>
        <Col span={8}>
          <Button type="default" block onClick={() => navigate('/analysis/prediction')}>
            预测分析
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default AnalysisDashboard;