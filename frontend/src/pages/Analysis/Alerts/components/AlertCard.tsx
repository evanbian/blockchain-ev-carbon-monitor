// src/pages/Analysis/Alerts/components/AlertCard.tsx
import React from 'react';
import { Card, Tag, Button, Typography, Space } from 'antd';
import { WarningOutlined, ClockCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Text, Paragraph } = Typography;

interface AlertCardProps {
  alert: {
    id: string;
    vin: string;
    type: string;
    level: string;
    message: string;
    time: string;
    status: string;
    licensePlate?: string;
    model?: string;
  };
  onViewDetails: () => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onViewDetails }) => {
  // 获取告警级别对应的颜色
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'blue';
      default:
        return 'default';
    }
  };
  
  // 获取告警状态对应的颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'red';
      case 'acknowledged':
        return 'orange';
      case 'resolved':
        return 'green';
      default:
        return 'default';
    }
  };
  
  // 获取告警级别的名称
  const getLevelName = (level: string) => {
    switch (level) {
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
      default:
        return level;
    }
  };
  
  // 获取告警状态的名称
  const getStatusName = (status: string) => {
    switch (status) {
      case 'new':
        return '未处理';
      case 'acknowledged':
        return '已确认';
      case 'resolved':
        return '已解决';
      default:
        return status;
    }
  };
  
  // 计算告警时间距离现在的时间
  const getTimeAgo = (timeStr: string) => {
    const time = moment(timeStr);
    return time.fromNow();
  };
  
  return (
    <Card
      hoverable
      style={{ 
        marginBottom: 16,
        borderLeft: `4px solid ${getLevelColor(alert.level)}`,
        opacity: alert.status === 'resolved' ? 0.7 : 1
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <Space>
          <Tag color={getLevelColor(alert.level)}>
            {getLevelName(alert.level)}
          </Tag>
          <Tag color={getStatusColor(alert.status)}>
            {getStatusName(alert.status)}
          </Tag>
          <Text type="secondary">
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            {getTimeAgo(alert.time)}
          </Text>
        </Space>
      </div>
      
      <Paragraph
        strong
        style={{ 
          fontSize: '16px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'flex-start'
        }}
      >
        <WarningOutlined style={{ marginRight: 8, marginTop: 4 }} />
        <span>{alert.message}</span>
      </Paragraph>
      
      <div style={{ marginBottom: 12 }}>
        <Text type="secondary">车辆: </Text>
        <Text strong>
          {alert.licensePlate || alert.vin.substring(0, 8) + '...'}
          {alert.model && ` (${alert.model})`}
        </Text>
      </div>
      
      <div style={{ textAlign: 'right', marginTop: 8 }}>
        <Button type="primary" size="small" onClick={onViewDetails}>
          查看详情
        </Button>
      </div>
    </Card>
  );
};

export default AlertCard;