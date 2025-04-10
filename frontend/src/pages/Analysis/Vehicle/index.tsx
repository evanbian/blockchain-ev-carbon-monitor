// src/pages/Analysis/Vehicle/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Select, Tabs, Spin, Button, DatePicker, Table, Tag, Tooltip, message, Empty } from 'antd';
import { InfoCircleOutlined, SearchOutlined, RedoOutlined } from '@ant-design/icons';
import EnergyUsageChart from './components/EnergyUsageChart';
import MileageChart from './components/MileageChart';
import dayjs, { Dayjs } from 'dayjs';
import vehicleAPI from '@/services/vehicles';
import vehicleAnalyticsAPI from '@/services/vehicleAnalytics';
import { Vehicle } from '@/types/vehicle';

interface DrivingData {
  totalMileage: number;
  totalEnergy: number;
  totalCarbonReduction: number;
  averageEfficiency: number;
}

interface DrivingTimeSeriesPoint {
  date: string;
  mileage: number;
  energy: number;
  carbonReduction: number;
  energyPer100km: number;
}

const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

type DateRange = [Dayjs | null, Dayjs | null] | null;

const VehicleAnalysis: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(null);
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<DrivingData | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<DrivingTimeSeriesPoint[]>([]);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const response = await vehicleAPI.getVehicles({ size: 1000 });
        if (isMounted) {
           if (response && response.data && response.data.items) {
            setVehicles(response.data.items);
           } else {
             setVehicles([]);
             message.warning('未能加载车辆列表');
           }
        }
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
        if (isMounted) {
            message.error('加载车辆列表失败');
            setVehicles([]);
        }
      } finally {
         if (isMounted) setLoading(false);
      }
    };
    fetchVehicles();
    return () => { isMounted = false };
  }, []);

  const fetchVehicleData = useCallback(async () => {
    if (!selectedVehicle || !dateRange || !dateRange[0] || !dateRange[1]) {
      setSummaryData(null);
      setTimeSeriesData([]);
      if (selectedVehicle || (dateRange && (dateRange[0] || dateRange[1]))) { 
         message.warning('请选择车辆并指定完整的日期范围');
      }
      return;
    }

    setLoading(true);
    setLoadingError(null);
    const startDate = dateRange[0]!.format('YYYY-MM-DD');
    const endDate = dateRange[1]!.format('YYYY-MM-DD');

    try {
      const [summaryRes, timeSeriesRes] = await Promise.all([
        vehicleAnalyticsAPI.getDrivingSummary(selectedVehicle!, startDate, endDate),
        vehicleAnalyticsAPI.getDrivingTimeSeries(selectedVehicle!, startDate, endDate, 'day')
      ]);
      
      setSummaryData(summaryRes?.data ?? null);
      setTimeSeriesData(timeSeriesRes?.data ?? []);

    } catch (error: any) {
      console.error("Failed to fetch vehicle analysis data:", error);
      const errorMsg = error?.response?.data?.message || error?.message || '加载分析数据失败，请稍后重试。';
      setLoadingError(errorMsg);
      message.error(errorMsg);
      setSummaryData(null);
      setTimeSeriesData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedVehicle, dateRange]);

  const handleVehicleChange = (value: string | null) => {
    setSelectedVehicle(value);
    setSummaryData(null);
    setTimeSeriesData([]);
    setLoadingError(null);
  };

  const handleDateChange = (dates: DateRange, dateStrings: [string, string]) => {
     setDateRange(dates);
  };
  
  const handleReset = () => {
    setSelectedVehicle(null);
    setDateRange(null);
    setSummaryData(null);
    setTimeSeriesData([]);
    setLoadingError(null);
  };
  
  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      defaultSortOrder: 'descend' as const,
      sorter: (a: DrivingTimeSeriesPoint, b: DrivingTimeSeriesPoint) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: '行驶里程(km)',
      dataIndex: 'mileage',
      key: 'mileage',
      render: (val: number) => val?.toFixed(2),
      sorter: (a: DrivingTimeSeriesPoint, b: DrivingTimeSeriesPoint) => a.mileage - b.mileage,
    },
    {
      title: '能耗(kWh)',
      dataIndex: 'energy',
      key: 'energy',
      render: (val: number) => val?.toFixed(2),
      sorter: (a: DrivingTimeSeriesPoint, b: DrivingTimeSeriesPoint) => a.energy - b.energy,
    },
    {
      title: '单位能耗(kWh/100km)',
      dataIndex: 'energyPer100km',
      key: 'energyPer100km',
      render: (text: number) => {
        if (text == null || isNaN(text)) return '-';
        const val = Number(text);
        return (
          <span>
            {val.toFixed(1)}
            {val > 18 ? (
              <Tag color="orange" style={{ marginLeft: 8 }}>偏高</Tag>
            ) : val < 12 ? (
              <Tag color="green" style={{ marginLeft: 8 }}>高效</Tag>
            ) : null}
          </span>
        );
      },
      sorter: (a: DrivingTimeSeriesPoint, b: DrivingTimeSeriesPoint) => a.energyPer100km - b.energyPer100km,
    },
    {
      title: '碳减排量(kg)',
      dataIndex: 'carbonReduction',
      key: 'carbonReduction',
      render: (val: number) => val?.toFixed(2),
      sorter: (a: DrivingTimeSeriesPoint, b: DrivingTimeSeriesPoint) => a.carbonReduction - b.carbonReduction,
    },
  ];
  
  const renderSummary = () => {
      if (loading || !summaryData) return null; 
      return (
          <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={12} sm={12} md={6} style={{ marginBottom: '8px'}}><Card size="small" title="总里程">{summaryData.totalMileage?.toFixed(2) ?? '-'} km</Card></Col>
              <Col xs={12} sm={12} md={6} style={{ marginBottom: '8px'}}><Card size="small" title="总能耗">{summaryData.totalEnergy?.toFixed(2) ?? '-'} kWh</Card></Col>
              <Col xs={12} sm={12} md={6} style={{ marginBottom: '8px'}}><Card size="small" title="总碳减排">{summaryData.totalCarbonReduction?.toFixed(2) ?? '-'} kg</Card></Col>
              <Col xs={12} sm={12} md={6} style={{ marginBottom: '8px'}}><Card size="small" title="平均能耗">{summaryData.averageEfficiency?.toFixed(1) ?? '-'} kWh/100km</Card></Col>
          </Row>
      );
  }

  const isQueryDisabled = !selectedVehicle || !dateRange || !dateRange[0] || !dateRange[1];

  return (
    <div className="vehicle-analysis">
      <Card title="车辆行驶与能耗分析" className="filter-card" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} sm={12} md={6}> 
            <label style={{display: 'block', marginBottom: '4px'}}>选择车辆</label>
            <Select
              placeholder="选择车辆"
              style={{ width: '100%' }}
              value={selectedVehicle}
              onChange={handleVehicleChange}
              allowClear
              showSearch 
              filterOption={(input, option) => 
                 (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
              loading={vehicles.length === 0 && loading}
              disabled={vehicles.length === 0 && !loading}
            >
              {vehicles.map(vehicle => (
                <Option key={vehicle.vin} value={vehicle.vin}>
                  {vehicle.licensePlate || vehicle.vin} ({vehicle.model})
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <label style={{display: 'block', marginBottom: '4px'}}>选择日期范围</label>
            <RangePicker 
              style={{ width: '100%' }}
              value={dateRange} 
              onChange={handleDateChange}
              format="YYYY-MM-DD"
              allowClear={true}
              placeholder={['开始日期', '结束日期']}
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Col>
          <Col xs={24} md={10} style={{ display: 'flex', alignItems: 'flex-end'}}> 
            <Button 
              type="primary" 
              icon={<SearchOutlined />} 
              onClick={fetchVehicleData} 
              disabled={isQueryDisabled || loading}
              loading={loading && !!selectedVehicle && !!dateRange}
            >
              查询
            </Button>
            <Button 
              icon={<RedoOutlined />} 
              style={{ marginLeft: 8 }} 
              onClick={handleReset} 
            >
              重置
            </Button>
            <Tooltip title="分析特定车辆在选定时间范围内的行驶数据、能耗数据和碳减排效率">
              <InfoCircleOutlined style={{ marginLeft: 8, cursor: 'help', fontSize: '16px', color: 'rgba(0, 0, 0, 0.45)' }} />
            </Tooltip>
          </Col>
        </Row>
      </Card>
      
      {loadingError && (
          <Card><div style={{color: 'red', textAlign: 'center', padding: '20px'}}>{loadingError}</div></Card>
      )}

      {!selectedVehicle && !loadingError ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            请选择车辆并指定日期范围进行分析
          </div>
        </Card>
      ) : loading && timeSeriesData.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
          </div>
        </Card>
      ) : (selectedVehicle && dateRange) && !loading && timeSeriesData.length === 0 && !loadingError ? (
          <Card><div style={{textAlign: 'center', padding: '50px 0'}}>选定范围内无分析数据</div></Card>
      ) : null}
      
      {!loading && (summaryData || timeSeriesData.length > 0) ? (
        <div>
          {renderSummary()} 
          <Tabs defaultActiveKey="energy">
            <TabPane tab="能耗与行驶数据" key="energy"> 
              <Card style={{ marginBottom: 16 }} title="能耗与里程趋势">
                 <EnergyUsageChart />
              </Card>
              <Card title="每日数据列表">
                <Table 
                  dataSource={timeSeriesData.map(d => ({...d, key: d.date}))} 
                  columns={columns} 
                  pagination={{ pageSize: 7, showSizeChanger: true, pageSizeOptions: ['7', '14', '21'] }}
                  rowKey="date"
                  size="small"
                  loading={loading && !!selectedVehicle && !!dateRange}
                />
              </Card>
            </TabPane>
            
            <TabPane tab="行驶模式分析 (占位符)" key="pattern">
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="时段分布 (占位符)" style={{ marginBottom: 16 }}>
                    <Empty description="功能待实现" />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="里程趋势 (图表)" style={{ marginBottom: 16 }}>
                    <MileageChart />
                  </Card>
                </Col>
              </Row>
              <Card title="驾驶习惯分析 (占位符)">
                <div style={{ padding: '20px 0' }}>
                  此部分需要进一步的后端数据支持和前端实现。
                </div>
              </Card>
            </TabPane>

          </Tabs>
        </div>
      ) : null}
    </div>
  );
};

export default VehicleAnalysis;