// src/pages/Analysis/Alerts/index.tsx
import React from 'react';
import { Tabs } from 'antd';
import RealTimeAlerts from './RealTimeAlerts';
import AlertHistory from './AlertHistory';
import { BellOutlined, HistoryOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

const AlertsAnalysis: React.FC = () => {
  return (
    <div className="alerts-analysis">
      <Tabs defaultActiveKey="realtime">
        <TabPane 
          tab={<span><BellOutlined /> 实时告警</span>}
          key="realtime"
        >
          <RealTimeAlerts />
        </TabPane>
        <TabPane 
          tab={<span><HistoryOutlined /> 告警历史</span>}
          key="history"
        >
          <AlertHistory />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AlertsAnalysis;