// src/pages/Analysis/Prediction/index.tsx
import React, { useState } from 'react';
import { Card, Row, Col, Select, Button, DatePicker, Statistic, Tabs, message } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';
import PredictionTrendChart from './components/PredictionTrendChart';
import SimulationChart from './components/SimulationChart';
import dayjs from 'dayjs';

const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const PredictionAnalysis: React.FC = () => {
  // 使用系统设置的全局固定日期
  const [loading, setLoading] = useState(false);
  const [predictionType, setPredictionType] = useState('carbon');
  const [predictionPeriod, setPredictionPeriod] = useState('month');
  const [predictionsGenerated, setPredictionsGenerated] = useState(false);
  const [dateRange, setDateRange] = useState<[any | null, any | null]>([null, null]);
  
  // 处理生成预测按钮点击
  const handleGeneratePrediction = () => {
    setLoading(true);
    message.info(`正在生成${predictionType === 'carbon' ? '碳减排' : 
                     predictionType === 'credits' ? '碳积分' : '行驶里程'}预测...`);
    
    // 模拟API调用延迟
    setTimeout(() => {
      setPredictionsGenerated(true);
      setLoading(false);
      message.success('预测生成成功！');
    }, 1500);
  };
  
  return (
    <div className="prediction-analysis">
      <Card title="预测分析" className="filter-card" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Select 
              placeholder="选择预测类型" 
              style={{ width: '100%' }} 
              defaultValue="carbon"
              onChange={(value) => setPredictionType(value)}
            >
              <Option value="carbon">碳减排预测</Option>
              <Option value="credits">碳积分预测</Option>
              <Option value="mileage">行驶里程预测</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Select 
              placeholder="预测周期" 
              style={{ width: '100%' }} 
              defaultValue="month"
              onChange={(value) => setPredictionPeriod(value)}
            >
              <Option value="week">周</Option>
              <Option value="month">月</Option>
              <Option value="quarter">季度</Option>
              <Option value="year">年</Option>
            </Select>
          </Col>
          <Col span={6}>
            <div style={{ position: 'relative' }}>
              <RangePicker 
                style={{ width: '100%' }}
                onChange={(dates) => setDateRange(dates)}
                format="YYYY-MM-DD"
                allowClear={true}
                placeholder={['开始日期', '结束日期']}
                disabledDate={(current) => current && current > dayjs().endOf('day')}
                popupStyle={{ zIndex: 1001 }}
              />
            </div>
          </Col>
          <Col span={6}>
            <Button 
              type="primary" 
              onClick={handleGeneratePrediction}
              loading={loading}
            >
              生成预测
            </Button>
          </Col>
        </Row>
      </Card>
      
      {/* 只有在生成预测后或已有预测数据时才显示数据 */}
      {predictionsGenerated ? (
        <>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title={`预计${predictionPeriod === 'week' ? '周' : 
                            predictionPeriod === 'month' ? '月' : 
                            predictionPeriod === 'quarter' ? '季度' : '年'}均${predictionType === 'carbon' ? '碳减排量' : 
                                                                      predictionType === 'credits' ? '碳积分' : '行驶里程'}`}
                  value={predictionType === 'carbon' ? 1050.8 : 
                         predictionType === 'credits' ? 52.5 : 
                         3152.4}
                  precision={1}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<ArrowUpOutlined />}
                  suffix={predictionType === 'carbon' ? 'kg' : 
                          predictionType === 'credits' ? '' : 
                          'km'}
                />
                <div style={{ fontSize: 12, color: '#999', marginTop: 5 }}>
                  相比上{predictionPeriod === 'week' ? '周' : 
                         predictionPeriod === 'month' ? '月' : 
                         predictionPeriod === 'quarter' ? '季度' : '年'}增长 9.7%
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title={`预计季度${predictionType === 'carbon' ? '减排总量' : 
                              predictionType === 'credits' ? '积分总量' : '里程总量'}`}
                  value={predictionType === 'carbon' ? 3152.4 : 
                         predictionType === 'credits' ? 157.6 : 
                         9457.2}
                  precision={1}
                  valueStyle={{ color: '#3f8600' }}
                  suffix={predictionType === 'carbon' ? 'kg' : 
                          predictionType === 'credits' ? '' : 
                          'km'}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title={`未来12个月${predictionType === 'carbon' ? '减排总量' : 
                                  predictionType === 'credits' ? '积分总量' : '里程总量'}`}
                  value={predictionType === 'carbon' ? 12609.6 : 
                         predictionType === 'credits' ? 630.5 : 
                         37828.8}
                  precision={1}
                  valueStyle={{ color: '#3f8600' }}
                  suffix={predictionType === 'carbon' ? 'kg' : 
                          predictionType === 'credits' ? '' : 
                          'km'}
                />
              </Card>
            </Col>
          </Row>
          
          <Tabs defaultActiveKey="trend">
            <TabPane tab="趋势预测" key="trend">
              <Card>
                <PredictionTrendChart 
                  predictionType={predictionType} 
                  predictionPeriod={predictionPeriod}
                />
              </Card>
            </TabPane>
            <TabPane tab="情景模拟" key="simulation">
              <Card>
                <SimulationChart 
                  predictionType={predictionType}
                />
              </Card>
            </TabPane>
          </Tabs>
        </>
      ) : (
        <Card>
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            请点击"生成预测"按钮开始分析
          </div>
        </Card>
      )}
    </div>
  );
};

export default PredictionAnalysis;