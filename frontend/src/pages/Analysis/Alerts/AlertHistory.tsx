// src/pages/Analysis/Alerts/AlertHistory.tsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Space, Button, Select, DatePicker, message } from 'antd';
import { SearchOutlined, SyncOutlined, EyeOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAlertsStart, fetchAlertsSuccess, fetchAlertsFailure } from '@/store/slices/alertsSlice';
import alertsAPI from '@/services/alerts';
import AlertDetailDrawer from './components/AlertDetailDrawer';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AlertHistory: React.FC = () => {
  const dispatch = useAppDispatch();
  const { alerts, totalAlerts, loading } = useAppSelector(state => state.alerts);
  const [currentAlert, setCurrentAlert] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filterParams, setFilterParams] = useState({
    level: 'all',
    status: 'all',
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
    vin: undefined
  });
  
  // 加载告警历史数据
  const loadAlertHistory = async (page = 1, pageSize = 10) => {
    try {
      dispatch(fetchAlertsStart());
      
      // Prepare parameters for the API call
      const apiParams: Record<string, any> = {
        page,
        size: pageSize,
        sort: 'alertTime,desc',
      };

      // Add VIN if present
      if (filterParams.vin) {
        apiParams.vin = filterParams.vin;
      }

      // Add level if not 'all', converting to uppercase
      if (filterParams.level && filterParams.level !== 'all') {
        apiParams.level = filterParams.level.toUpperCase();
      }

      // Add status if not 'all', mapping values
      if (filterParams.status && filterParams.status !== 'all') {
        if (filterParams.status === 'new') {
          apiParams.status = 'NEW';
        } else if (filterParams.status === 'resolved') {
          apiParams.status = 'RESOLVED';
        }
        // Note: 'acknowledged' is currently not sent to the backend filter
      }

      // Add date range if present
      if (filterParams.startDate) {
        apiParams.startDate = filterParams.startDate;
      }
      if (filterParams.endDate) {
        apiParams.endDate = filterParams.endDate;
      }
      
      // console.log('Sending API params:', apiParams); // Debug log

      const response = await alertsAPI.getAlerts(apiParams);
      
      if (response && response.data && response.data.content) {
        dispatch(fetchAlertsSuccess({ 
            items: response.data.content, 
            total: response.data.totalElements || 0
        }));
        setPagination({
          ...pagination,
          current: page,
          pageSize,
          total: response.data.totalElements || 0
        });
      } else {
        console.warn("Invalid API response structure for alert history:", response);
        dispatch(fetchAlertsSuccess({ items: [], total: 0 }));
         setPagination({
          ...pagination,
          current: page,
          pageSize,
          total: 0
        });
      }

    } catch (error) {
      console.error('加载告警历史数据失败:', error);
      dispatch(fetchAlertsFailure(error instanceof Error ? error.message : 'Unknown error'));
      message.error('加载告警历史数据失败');
    }
  };
  
  // 初始加载
  useEffect(() => {
    loadAlertHistory();
  }, []);
  
  // 处理表格变化
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    loadAlertHistory(pagination.current, pagination.pageSize);
  };
  
  // 处理筛选变化
  const handleFilterChange = () => {
    loadAlertHistory(1, pagination.pageSize);
  };
  
  // 重置筛选条件
  const handleResetFilter = () => {
    setFilterParams({
      level: 'all',
      status: 'all',
      startDate: undefined,
      endDate: undefined,
      vin: undefined
    });
    loadAlertHistory(1, pagination.pageSize);
  };
  
  // 查看告警详情
  const handleViewAlert = (alertId: string) => {
    setCurrentAlert(alertId);
  };
  
  // 关闭详情抽屉
  const handleCloseDrawer = () => {
    setCurrentAlert(null);
  };
  
  // 表格列定义
  const columns = [
    {
      title: '告警ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      ellipsis: true
    },
    {
      title: '车辆',
      dataIndex: 'vin',
      key: 'vin',
      render: (text: string) => text.substring(0, 8) + '...'
    },
    {
      title: '告警类型',
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: '告警级别',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => {
        const colors = {
          low: 'blue',
          medium: 'orange',
          high: 'red'
        };
        const levelName = {
          low: '低',
          medium: '中',
          high: '高'
        };
        // Convert incoming level (e.g., 'HIGH') to lowercase ('high') for lookup
        const lookupKey = level ? level.toLowerCase() : '';
        return (
          <Tag color={colors[lookupKey as keyof typeof colors] || 'default'}>
            {levelName[lookupKey as keyof typeof levelName] || level}
          </Tag>
        );
      }
    },
    {
      title: '告警信息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        // Map backend status (NEW/ACKNOWLEDGED/RESOLVED) to frontend display keys
        let displayKey: string;
        if (status === 'NEW') {
          displayKey = 'new'; // Use 'new' for styling/naming
        } else if (status === 'RESOLVED') {
          displayKey = 'resolved'; // Use 'resolved' for styling/naming
        } else if (status === 'ACKNOWLEDGED') {
          displayKey = 'acknowledged'; // Use 'acknowledged' for styling/naming
        } else {
          displayKey = status; // Fallback
        }

        const colors = {
          new: 'red', // Corresponds to NEW
          acknowledged: 'orange', // Corresponds to ACKNOWLEDGED
          resolved: 'green' // Corresponds to RESOLVED
        };
        const statusName = {
          new: '未处理', // Corresponds to NEW
          acknowledged: '已确认', // Corresponds to ACKNOWLEDGED
          resolved: '已解决' // Corresponds to RESOLVED
        };
        return (
          <Tag color={colors[displayKey as keyof typeof colors] || 'default'}>
            {statusName[displayKey as keyof typeof statusName] || status}
          </Tag>
        );
      }
    },
    {
      title: '时间',
      dataIndex: 'alertTime',
      key: 'alertTime',
      sorter: true,
      render: (text: string) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button 
          type="link" 
          size="small" 
          icon={<EyeOutlined />}
          onClick={() => handleViewAlert(record.id)}
        >
          查看
        </Button>
      )
    }
  ];
  
  return (
    <div className="alert-history">
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Select
              placeholder="告警级别"
              style={{ width: 120 }}
              value={filterParams.level}
              onChange={(value) => setFilterParams({...filterParams, level: value})}
            >
              <Option value="all">全部级别</Option>
              <Option value="high">高</Option>
              <Option value="medium">中</Option>
              <Option value="low">低</Option>
            </Select>
            
            <Select
              placeholder="告警状态"
              style={{ width: 120 }}
              value={filterParams.status}
              onChange={(value) => setFilterParams({...filterParams, status: value})}
            >
              <Option value="all">全部状态</Option>
              <Option value="new">未处理</Option>
              <Option value="acknowledged">已确认</Option>
              <Option value="resolved">已解决</Option>
            </Select>
            
            <RangePicker
              onChange={(dates, dateStrings) => {
                setFilterParams({
                  ...filterParams, 
                  startDate: dateStrings[0] || undefined,
                  endDate: dateStrings[1] || undefined
                });
              }}
            />
            
            <Button 
              type="primary" 
              icon={<SearchOutlined />} 
              onClick={handleFilterChange}
            >
              查询
            </Button>
            
            <Button onClick={handleResetFilter}>重置</Button>
            
            <Button 
              icon={<SyncOutlined />} 
              onClick={() => loadAlertHistory(pagination.current, pagination.pageSize)}
              loading={loading}
            >
              刷新
            </Button>
          </Space>
        </div>
        
        <Table
          columns={columns}
          dataSource={alerts}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条告警`
          }}
          loading={loading}
          onChange={handleTableChange}
        />
      </Card>
      
      <AlertDetailDrawer
        alertId={currentAlert}
        visible={currentAlert !== null}
        onClose={handleCloseDrawer}
      />
    </div>
  );
};

export default AlertHistory;