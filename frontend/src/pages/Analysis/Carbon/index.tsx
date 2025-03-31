// src/pages/Analysis/Carbon/index.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Radio, Select, Spin } from 'antd';
import { AreaChartOutlined, BarChartOutlined } from '@ant-design/icons';
import moment from 'moment';
import CarbonTrendChart from './components/CarbonTrendChart';
import CarbonComparisonChart from './components/CarbonComparisonChart';
import VehicleComparisonChart from './components/VehicleComparisonChart';

const { RangePicker } = DatePicker;
const { Option } = Select;

const CarbonAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<[moment.Moment, moment.Moment] | null>(null);
  const [groupBy, setGroupBy] = useState<string>('day');
  const [chartType, setChartType] = useState<string>('line');
  
  // 这里将来会通过API获取数据
  const mockData = {
    totalReduction: 12584.2,
    monthlyReduction: 958.3,
    dailyAverage: 32.5,
    comparedToFuel: 18876.3,
    equivalentTrees: 629,
    equivalentCO2: 12.6
  };
  
  useEffect(() => {
    // 模拟加载数据
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [timeRange, groupBy]);
  
  return (
    <div className="carbon-analysis">
      <Card title="碳减排分析" className="filter-card" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <RangePicker 
              style={{ width: '100%' }}
              onChange={(dates) => setTimeRange(dates as any)}
              placeholder={['开始日期', '结束日期']}
            />
          </Col>
          <Col span={5}>
            <Radio.Group
              value={groupBy}
              onChange={e => setGroupBy(e.target.value)}
              buttonStyle="solid"
              optionType="button"
            >
              <Radio.Button value="day">按日</Radio.Button>
              <Radio.Button value="week">按周</Radio.Button>
              <Radio.Button value="month">按月</Radio.Button>
            </Radio.Group>
          </Col>
          <Col span={5}>
            <Radio.Group
              value={chartType}
              onChange={e => setChartType(e.target.value)}
              buttonStyle="solid"
              optionType="button"
            >
              <Radio.Button value="line"><AreaChartOutlined /> 趋势图</Radio.Button>
              <Radio.Button value="bar"><BarChartOutlined /> 柱状图</Radio.Button>
            </Radio.Group>
          </Col>
          <Col span={6}>
            <Select 
              placeholder="选择车辆" 
              style={{ width: '100%' }} 
              allowClear
              defaultValue="all"
            >
              <Option value="all">所有车辆</Option>
              <Option value="LSVAU2180N2183294">京A12345 (比亚迪汉EV)</Option>
              <Option value="LNBSCCAK7JW217931">京B54321 (特斯拉Model 3)</Option>
              <Option value="WVWZZZ1KZAP035125">京C98765 (蔚来ES6)</Option>
            </Select>
          </Col>
        </Row>
      </Card>
      
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总碳减排量"
              value={mockData.totalReduction}
              precision={1}
              suffix="kg"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="月平均碳减排"
              value={mockData.monthlyReduction}
              precision={1}
              suffix="kg/月"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="日平均碳减排"
              value={mockData.dailyAverage}
              precision={1}
              suffix="kg/日"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="相当于减少燃油消耗"
              value={mockData.comparedToFuel}
              precision={1}
              suffix="L"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="相当于种植树木"
              value={mockData.equivalentTrees}
              suffix="棵"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="相当于二氧化碳减排"
              value={mockData.equivalentCO2}
              precision={1}
              suffix="吨"
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Card title="碳减排趋势" style={{ marginTop: 16 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          <CarbonTrendChart chartType={chartType} groupBy={groupBy} />
        )}
      </Card>
      
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="碳减排对比">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <CarbonComparisonChart />
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="车型碳减排对比">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <VehicleComparisonChart />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CarbonAnalysis;