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
    startDate: undefined,
    endDate: undefined,
    vin: undefined
  });
  
  // 加载告警历史数据
  const loadAlertHistory = async (page = 1, pageSize = 10) => {
    try {
      dispatch(fetchAlertsStart());
      
      const response = await alertsAPI.getAlerts({
        page,
        size: pageSize,
        ...filterParams
      });
      
      dispatch(fetchAlertsSuccess(response.data));
      setPagination({
        ...pagination,
        current: page,
        pageSize,
        total: response.data.total
      });
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
        return (
          <Tag color={colors[level as keyof typeof colors] || 'default'}>
            {levelName[level as keyof typeof levelName] || level}
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
        const colors = {
          new: 'red',
          acknowledged: 'orange',
          resolved: 'green'
        };
        const statusName = {
          new: '未处理',
          acknowledged: '已确认',
          resolved: '已解决'
        };
        return (
          <Tag color={colors[status as keyof typeof colors] || 'default'}>
            {statusName[status as keyof typeof statusName] || status}
          </Tag>
        );
      }
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      sorter: true,
      render: (text: string) => moment(text).format('YYYY-MM-DD HH:mm:ss')
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
              onChange={(dates) => {
                if (dates) {
                  setFilterParams({
                    ...filterParams, 
                    startDate: dates[0]?.format('YYYY-MM-DD'),
                    endDate: dates[1]?.format('YYYY-MM-DD')
                  });
                } else {
                  setFilterParams({
                    ...filterParams,
                    startDate: undefined,
                    endDate: undefined
                  });
                }
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
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
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