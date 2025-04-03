// src/pages/Analysis/Alerts/components/AlertStatusTag.tsx
import React from 'react';
import { Tag } from 'antd';

interface AlertStatusTagProps {
  status: string;
  style?: React.CSSProperties;
}

const AlertStatusTag: React.FC<AlertStatusTagProps> = ({ status, style }) => {
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
  
  return (
    <Tag 
      color={getStatusColor(status)} 
      style={style}
    >
      {getStatusName(status)}
    </Tag>
  );
};

export default AlertStatusTag;