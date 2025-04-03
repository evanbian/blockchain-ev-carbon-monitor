// src/pages/Analysis/Carbon/index.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Radio, Select, Spin, message, Alert } from 'antd';
import { AreaChartOutlined, BarChartOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import CarbonTrendChart from './components/CarbonTrendChart';
import CarbonComparisonChart from './components/CarbonComparisonChart';
import VehicleComparisonChart from './components/VehicleComparisonChart';
import {
  getCarbonSummary,
  getCarbonTrends,
  getCarbonByModel,
  CarbonSummary,
  CarbonTrend,
  CarbonModelData
} from '@/services/analytics';
import vehicleAPI from '@/services/vehicles';
import { Vehicle } from '@/types/vehicle';

const { RangePicker } = DatePicker;
const { Option } = Select;

// Change state to store date strings directly
type TimeRangeType = [string, string] | null;

const CarbonAnalysis: React.FC = () => {
  // 使用系统设置的全局固定日期
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Initialize with formatted strings
  const [timeRange, setTimeRange] = useState<TimeRangeType>([
    dayjs().startOf('day').locale('en').format('YYYY-MM-DD'), 
    dayjs().endOf('day').locale('en').format('YYYY-MM-DD')
  ]);
  const [groupBy, setGroupBy] = useState<string>('day');
  const [chartType, setChartType] = useState<string>('line');
  const [summaryData, setSummaryData] = useState<CarbonSummary | null>(null);
  const [trendData, setTrendData] = useState<CarbonTrend[]>([]);
  const [modelData, setModelData] = useState<CarbonModelData[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  
  const fetchVehicles = async () => {
    setVehiclesLoading(true);
    try {
      const response = await vehicleAPI.getVehicles({ 
        size: 1000,
        status: 'all'
      });
      
      // 修改这里：从 items 获取数据，而不是 content
      console.log('API返回数据:', response.data?.items);
      
      if (response.data?.items) {
        setVehicles(response.data.items);
      }
    } catch (error) {
      console.error('获取车辆列表失败:', error);
      message.error('获取车辆列表失败');
    } finally {
      setVehiclesLoading(false);
    }
  };
  
  const fetchData = async () => {
    if (!timeRange) {
      // Optionally clear data or show a message if no date range is selected
      setSummaryData(null);
      setTrendData([]);
      setModelData([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [startDateString, endDateString] = timeRange; // State holds strings now
      // console.log('Sending startDateString:', startDateString);
      // console.log('Sending endDateString:', endDateString);
      const [summaryRes, trendsRes, modelsRes] = await Promise.all([
        // Pass strings directly to service functions
        getCarbonSummary(startDateString, endDateString, selectedVehicleId || undefined),
        getCarbonTrends(startDateString, endDateString, groupBy as 'day' | 'week' | 'month', selectedVehicleId || undefined),
        getCarbonByModel(startDateString, endDateString, selectedVehicleId || undefined)
      ]);
      
      setSummaryData(summaryRes.data);
      setTrendData(trendsRes.data.timeline || []);
      setModelData(modelsRes.data.models || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取数据失败，请稍后重试';
      setError(errorMessage);
      message.error(errorMessage);
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchVehicles();
  }, []);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    fetchData();
  }, [timeRange, groupBy, selectedVehicleId]);
  
  const handleVehicleChange = (value: string) => {
    setSelectedVehicleId(value === 'all' ? null : value);
  };
  
  const renderContent = () => {
    if (error) {
      return (
        <Alert
          message="数据加载失败"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      );
    }
    
    return (
      <>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card>
              <Statistic
                title="总碳减排量"
                value={summaryData?.totalReduction}
                precision={1}
                suffix="kg"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="经济价值 (估算)"
                value={summaryData?.economicValue}
                precision={2}
                prefix="¥"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="参与车辆数"
                value={summaryData?.vehicleCount}
                suffix="辆"
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
                value={summaryData?.comparedToFuel}
                precision={1}
                suffix="L"
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="相当于种植树木 (估算)"
                value={summaryData?.equivalentTrees}
                suffix="棵"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card style={{ visibility: 'hidden' }} />
          </Col>
        </Row>
        
        <Card title="碳减排趋势" style={{ marginTop: 16 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin size="large" />
            </div>
          ) : (
            <CarbonTrendChart 
              chartType={chartType} 
              groupBy={groupBy}
              data={trendData}
            />
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
                <CarbonComparisonChart data={summaryData} />
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
                <VehicleComparisonChart data={modelData} />
              )}
            </Card>
          </Col>
        </Row>
      </>
    );
  };
  
  // Use dateStrings from onChange directly
  const handleRangeChange = (dates: any, dateStrings: [string, string]) => {
    // console.log('RangePicker raw dates:', dates);
    // console.log('RangePicker dateStrings:', dateStrings);
    if (dateStrings && dateStrings[0] && dateStrings[1]) {
        // Directly set the formatted strings provided by Ant Design
        setTimeRange(dateStrings);
    } else {
        // Handle clear event or invalid input
        setTimeRange(null);
    }
  };

  return (
    <div className="carbon-analysis">
      <Card title="碳减排分析" className="filter-card" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <div style={{ position: 'relative' }}>
              <RangePicker 
                style={{ width: '100%' }}
                // value needs to be Dayjs objects for the component to display correctly
                // We convert the string state back to Dayjs for the value prop
                value={timeRange ? [dayjs(timeRange[0]), dayjs(timeRange[1])] : null}
                onChange={handleRangeChange} 
                placeholder={['开始日期', '结束日期']}
                format="YYYY-MM-DD" // Ensure format matches what we expect in dateStrings
                allowClear={true}
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </div>
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
              onChange={handleVehicleChange}
              loading={vehiclesLoading}
            >
              <Option value="all">所有车辆</Option>
              {vehicles.map(vehicle => (
                <Option key={vehicle.vin} value={vehicle.vin}>
                  {vehicle.licensePlate} ({vehicle.model})
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>
      
      {renderContent()}
    </div>
  );
};

export default CarbonAnalysis;