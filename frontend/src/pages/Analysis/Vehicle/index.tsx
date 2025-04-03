// src/pages/Analysis/Vehicle/index.tsx
import React, { useState } from 'react';
import { Card, Row, Col, Select, Tabs, Spin, Button, DatePicker, Table, Tag, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import EnergyUsageChart from './components/EnergyUsageChart';
import DrivingPatternChart from './components/DrivingPatternChart';
import MileageChart from './components/MileageChart';
import dayjs from 'dayjs';

const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const VehicleAnalysis: React.FC = () => {
  // 使用系统设置的全局固定日期
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const mockVehicles = [
    { vin: 'LSVAU2180N2183294', model: '比亚迪汉EV', licensePlate: '京A12345', status: 'online' },
    { vin: 'LNBSCCAK7JW217931', model: '特斯拉Model 3', licensePlate: '京B54321', status: 'offline' },
    { vin: 'WVWZZZ1KZAP035125', model: '蔚来ES6', licensePlate: '京C98765', status: 'online' }
  ];
  
  const handleVehicleChange = (value: string) => {
    setLoading(true);
    setSelectedVehicle(value);
    
    // 模拟数据加载
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  
  // 表格数据
  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '行驶里程(km)',
      dataIndex: 'mileage',
      key: 'mileage',
      sorter: (a: any, b: any) => a.mileage - b.mileage,
    },
    {
      title: '能耗(kWh)',
      dataIndex: 'energy',
      key: 'energy',
      sorter: (a: any, b: any) => a.energy - b.energy,
    },
    {
      title: '单位能耗(kWh/100km)',
      dataIndex: 'energyPer100km',
      key: 'energyPer100km',
      render: (text: number) => (
        <span>
          {text.toFixed(1)}
          {text > 15 ? (
            <Tag color="orange" style={{ marginLeft: 8 }}>偏高</Tag>
          ) : text < 12 ? (
            <Tag color="green" style={{ marginLeft: 8 }}>高效</Tag>
          ) : null}
        </span>
      ),
      sorter: (a: any, b: any) => a.energyPer100km - b.energyPer100km,
    },
    {
      title: '碳减排量(kg)',
      dataIndex: 'carbonReduction',
      key: 'carbonReduction',
      sorter: (a: any, b: any) => a.carbonReduction - b.carbonReduction,
    },
    {
      title: '效率评分',
      dataIndex: 'efficiencyScore',
      key: 'efficiencyScore',
      render: (text: number) => {
        let color = 'red';
        if (text >= 90) color = 'green';
        else if (text >= 70) color = 'lime';
        else if (text >= 50) color = 'orange';
        
        return (
          <Tooltip title={`基于能耗效率和行驶模式的综合评分`}>
            <Tag color={color}>{text}</Tag>
          </Tooltip>
        );
      },
      sorter: (a: any, b: any) => a.efficiencyScore - b.efficiencyScore,
    },
  ];
  
  const dataSource = [
    {
      key: '1',
      date: '2023-06-25',
      mileage: 58.5,
      energy: 9.6,
      energyPer100km: 16.4,
      carbonReduction: 15.2,
      efficiencyScore: 65,
    },
    {
      key: '2',
      date: '2023-06-26',
      mileage: 42.3,
      energy: 6.5,
      energyPer100km: 15.4,
      carbonReduction: 11.8,
      efficiencyScore: 72,
    },
    {
      key: '3',
      date: '2023-06-27',
      mileage: 65.1,
      energy: 9.2,
      energyPer100km: 14.1,
      carbonReduction: 18.5,
      efficiencyScore: 79,
    },
    {
      key: '4',
      date: '2023-06-28',
      mileage: 38.7,
      energy: 4.5,
      energyPer100km: 11.6,
      carbonReduction: 11.4,
      efficiencyScore: 93,
    },
    {
      key: '5',
      date: '2023-06-29',
      mileage: 72.4,
      energy: 10.8,
      energyPer100km: 14.9,
      carbonReduction: 20.3,
      efficiencyScore: 75,
    },
    {
      key: '6',
      date: '2023-06-30',
      mileage: 43.9,
      energy: 7.2,
      energyPer100km: 16.4,
      carbonReduction: 12.1,
      efficiencyScore: 65,
    },
    {
      key: '7',
      date: '2023-07-01',
      mileage: 52.3,
      energy: 6.8,
      energyPer100km: 13.0,
      carbonReduction: 15.6,
      efficiencyScore: 86,
    },
  ];
  
  return (
    <div className="vehicle-analysis">
      <Card title="车辆分析" className="filter-card" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Select
              placeholder="选择车辆"
              style={{ width: '100%' }}
              onChange={handleVehicleChange}
              allowClear
            >
              {mockVehicles.map(vehicle => (
                <Option key={vehicle.vin} value={vehicle.vin}>
                  {vehicle.licensePlate} ({vehicle.model})
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <div style={{ position: 'relative' }}>
              <RangePicker 
                style={{ width: '100%' }} 
                format="YYYY-MM-DD"
                allowClear={true}
                showToday={true}
                placeholder={['开始日期', '结束日期']}
                disabledDate={(current) => current && current > dayjs().endOf('day')}
                popupStyle={{ zIndex: 1001 }}
              />
            </div>
          </Col>
          <Col span={8}>
            <Button type="primary">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }}>
              重置
            </Button>
            <Tooltip title="分析特定车辆在选定时间范围内的行驶数据、能耗数据和碳减排效率">
              <InfoCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </Col>
        </Row>
      </Card>
      
      {!selectedVehicle ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            请选择要分析的车辆
          </div>
        </Card>
      ) : loading ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
          </div>
        </Card>
      ) : (
        <div>
          <Tabs defaultActiveKey="energy">
            <TabPane tab="能耗分析" key="energy">
              <Card style={{ marginBottom: 16 }}>
                <EnergyUsageChart />
              </Card>
              <Card title="行驶数据列表">
                <Table 
                  dataSource={dataSource} 
                  columns={columns} 
                  pagination={{ pageSize: 5 }}
                />
              </Card>
            </TabPane>
            
            <TabPane tab="行驶模式分析" key="pattern">
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="时段分布" style={{ marginBottom: 16 }}>
                    <DrivingPatternChart />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="里程趋势" style={{ marginBottom: 16 }}>
                    <MileageChart />
                  </Card>
                </Col>
              </Row>
              
              <Card title="驾驶习惯分析">
                <div style={{ padding: '20px 0' }}>
                  <p>1. <strong>能耗效率</strong>: 该车辆平均单位能耗为 <strong>14.5 kWh/100km</strong>，相比同型号车辆平均水平低约5%，表现良好。</p>
                  <p>2. <strong>行驶时段</strong>: 主要集中在早高峰(7:00-9:00)和晚高峰(17:00-19:00)，典型的通勤模式。</p>
                  <p>3. <strong>加速特性</strong>: 中等加速占比较高，急加速情况较少，驾驶习惯较为平稳。</p>
                  <p>4. <strong>制动模式</strong>: 能量回收制动占比约68%，高于平均水平，有助于提高续航能力。</p>
                  <p>5. <strong>改进建议</strong>: 建议减少急加速次数，增加平稳驾驶时间，可进一步提升能源效率。</p>
                </div>
              </Card>
            </TabPane>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default VehicleAnalysis;