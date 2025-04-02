// src/pages/Analysis/Alerts/components/AlertDetailDrawer.tsx
import React, { useState, useEffect } from 'react';
import { Drawer, Descriptions, Button, Spin, Tag, message, Space, Select, Input, Divider } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, SyncOutlined, WarningOutlined } from '@ant-design/icons';
import moment from 'moment';
import alertsAPI from '@/services/alerts';
import { useAppDispatch } from '@/store/hooks';
import { updateAlertStatusSuccess } from '@/store/slices/alertsSlice';

const { Option } = Select;
const { TextArea } = Input;

interface AlertDetailDrawerProps {
  alertId: string | null;
  visible: boolean;
  onClose: () => void;
}

const AlertDetailDrawer: React.FC<AlertDetailDrawerProps> = ({ alertId, visible, onClose }) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  
  // 加载告警详情
  useEffect(() => {
    if (alertId && visible) {
      loadAlertDetail(alertId);
    } else {
      setAlert(null);
      setNewStatus('');
      setComment('');
    }
  }, [alertId, visible]);
  
  const loadAlertDetail = async (id: string) => {
    try {
      setLoading(true);
      const response = await alertsAPI.getAlertById(id);
      setAlert(response.data);
      // src/pages/Analysis/Alerts/components/AlertDetailDrawer.tsx（继续）
      setLoading(false);
    } catch (error) {
      console.error('加载告警详情失败:', error);
      message.error('加载告警详情失败');
      setLoading(false);
      onClose();
    }
  };
  
  // 更新告警状态
  const handleUpdateStatus = async () => {
    if (!alert || !newStatus) return;
    
    try {
      setUpdating(true);
      await alertsAPI.updateAlertStatus(alert.id, {
        status: newStatus,
        comment: comment
      });
      
      // 更新Redux状态
      dispatch(updateAlertStatusSuccess({
        id: alert.id,
        status: newStatus
      }));
      
      // 更新本地状态
      setAlert({
        ...alert,
        status: newStatus
      });
      
      message.success('状态更新成功');
      setUpdating(false);
      setNewStatus('');
      setComment('');
    } catch (error) {
      console.error('更新告警状态失败:', error);
      message.error('更新告警状态失败');
      setUpdating(false);
    }
  };
  
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
  
  return (
    <Drawer
      title="告警详情"
      placement="right"
      width={550}
      onClose={onClose}
      visible={visible}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose}>关闭</Button>
        </div>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
        </div>
      ) : alert ? (
        <>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="告警ID">{alert.id}</Descriptions.Item>
            <Descriptions.Item label="告警级别">
              <Tag color={getLevelColor(alert.level)}>
                {getLevelName(alert.level)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="告警类型">{alert.type}</Descriptions.Item>
            <Descriptions.Item label="告警状态">
              <Tag color={getStatusColor(alert.status)}>
                {getStatusName(alert.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="告警时间">
              {moment(alert.time).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="告警信息">{alert.message}</Descriptions.Item>
            <Descriptions.Item label="告警详情">{alert.detail}</Descriptions.Item>
            <Descriptions.Item label="车辆信息">
              <div>VIN: {alert.vin}</div>
              {alert.licensePlate && <div>车牌号: {alert.licensePlate}</div>}
              {alert.model && <div>车型: {alert.model}</div>}
            </Descriptions.Item>
            {alert.relatedData && (
              <Descriptions.Item label="相关数据">
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(alert.relatedData, null, 2)}
                </pre>
              </Descriptions.Item>
            )}
          </Descriptions>
          
          {alert.status !== 'resolved' && (
            <>
              <Divider />
              <div>
                <h3>更新状态</h3>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Select
                    placeholder="选择新状态"
                    style={{ width: '100%' }}
                    value={newStatus}
                    onChange={setNewStatus}
                  >
                    {alert.status === 'new' && (
                      <Option value="acknowledged">确认告警</Option>
                    )}
                    <Option value="resolved">标记为已解决</Option>
                  </Select>
                  
                  <TextArea
                    rows={4}
                    placeholder="添加备注..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  
                  <Button
                    type="primary"
                    loading={updating}
                    disabled={!newStatus}
                    onClick={handleUpdateStatus}
                  >
                    更新状态
                  </Button>
                </Space>
              </div>
            </>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          未找到告警信息
        </div>
      )}
    </Drawer>
  );
};

export default AlertDetailDrawer;