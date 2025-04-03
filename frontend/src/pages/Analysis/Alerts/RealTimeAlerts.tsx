// src/pages/Analysis/Alerts/RealTimeAlerts.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Button, Empty, Spin, message } from 'antd';
import { SyncOutlined, FilterOutlined } from '@ant-design/icons';
import AlertCard from './components/AlertCard';
import AlertFilter from './components/AlertFilter';
import AlertDetailDrawer from './components/AlertDetailDrawer';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAlertsStart, fetchAlertsSuccess, fetchAlertsFailure } from '@/store/slices/alertsSlice';
import alertsAPI from '@/services/alerts';

const { Option } = Select;

const RealTimeAlerts: React.FC = () => {
  const dispatch = useAppDispatch();
  const { alerts, loading, error } = useAppSelector(state => state.alerts);
  const [filterVisible, setFilterVisible] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<string | null>(null);
  const [filterParams, setFilterParams] = useState({
    status: 'new',
    level: 'all',
    vin: undefined
  });
  
  // 加载告警数据
  const loadAlerts = async () => {
    try {
      dispatch(fetchAlertsStart());
      
      // 设置默认筛选为"未处理"的告警
      const response = await alertsAPI.getAlerts({
        page: 1,
        size: 50,
        ...filterParams
      });
      dispatch(fetchAlertsSuccess(response.data));
    } catch (error) {
      console.error('加载告警数据失败:', error);
      dispatch(fetchAlertsFailure(error instanceof Error ? error.message : 'Unknown error'));
      message.error('加载告警数据失败');
    }
  };
  
  // 初始加载
  useEffect(() => {
    loadAlerts();
    
    // 模拟实时数据: 每10秒自动刷新
    const interval = setInterval(() => {
      loadAlerts();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [filterParams]);
  
  // 更新筛选条件
  const handleFilterChange = (newFilters: any) => {
    setFilterParams({...filterParams, ...newFilters});
    setFilterVisible(false);
  };
  
  // 查看告警详情
  const handleViewAlert = (alertId: string) => {
    setCurrentAlert(alertId);
  };
  
  // 关闭详情抽屉
  const handleCloseDrawer = () => {
    setCurrentAlert(null);
  };
  
  // 渲染告警卡片
  const renderAlertCards = () => {
    if (loading && alerts.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
        </div>
      );
    }
    
    if (alerts.length === 0) {
      return (
        <Empty 
          description="暂无告警数据" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      );
    }
    
    return (
      <Row gutter={[16, 16]}>
        {alerts.map(alert => (
          <Col xs={24} sm={12} md={8} key={alert.id}>
            <AlertCard 
              alert={alert} 
              onViewDetails={() => handleViewAlert(alert.id)}
            />
          </Col>
        ))}
      </Row>
    );
  };
  
  return (
    <div className="real-time-alerts">
      <Card
        title="实时告警监控"
        extra={
          <div>
            <Button 
              icon={<FilterOutlined />} 
              onClick={() => setFilterVisible(true)}
              style={{ marginRight: 8 }}
            >
              筛选
            </Button>
            <Button 
              icon={<SyncOutlined />} 
              onClick={loadAlerts}
              loading={loading}
            >
              刷新
            </Button>
          </div>
        }
      >
        {renderAlertCards()}
      </Card>
      
      <AlertFilter 
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={handleFilterChange}
        initialValues={filterParams}
      />
      
      <AlertDetailDrawer
        alertId={currentAlert}
        visible={currentAlert !== null}
        onClose={handleCloseDrawer}
      />
    </div>
  );
};

export default RealTimeAlerts;