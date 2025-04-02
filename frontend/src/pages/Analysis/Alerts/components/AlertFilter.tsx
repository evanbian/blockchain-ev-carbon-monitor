// src/pages/Analysis/Alerts/components/AlertFilter.tsx
import React, { useState, useEffect } from 'react';
import { Drawer, Form, Button, Select, DatePicker, Space } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useAppSelector } from '@/store/hooks';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface AlertFilterProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  initialValues?: any;
}

const AlertFilter: React.FC<AlertFilterProps> = ({ 
  visible, 
  onClose, 
  onApply,
  initialValues = {}
}) => {
  const [form] = Form.useForm();
  const { vehicles } = useAppSelector(state => state.vehicles);
  
  // 当初始值变化时，更新表单
  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        level: initialValues.level || 'all',
        status: initialValues.status || 'all',
        vin: initialValues.vin,
        dateRange: initialValues.startDate && initialValues.endDate ? 
          [moment(initialValues.startDate), moment(initialValues.endDate)] : undefined
      });
    }
  }, [visible, initialValues, form]);
  
  const handleSubmit = () => {
    form.validateFields().then(values => {
      const filters: any = {
        level: values.level,
        status: values.status,
        vin: values.vin
      };
      
      if (values.dateRange) {
        filters.startDate = values.dateRange[0].format('YYYY-MM-DD');
        filters.endDate = values.dateRange[1].format('YYYY-MM-DD');
      }
      
      onApply(filters);
    });
  };
  
  return (
    <Drawer
      title={
        <div>
          <FilterOutlined style={{ marginRight: 8 }} />
          告警筛选
        </div>
      }
      placement="right"
      closable={true}
      onClose={onClose}
      visible={visible}
      width={320}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={() => form.resetFields()}>重置</Button>
            <Button type="primary" onClick={handleSubmit}>应用</Button>
          </Space>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="level"
          label="告警级别"
        >
          <Select placeholder="选择告警级别">
            <Option value="all">全部级别</Option>
            <Option value="high">高</Option>
            <Option value="medium">中</Option>
            <Option value="low">低</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="status"
          label="告警状态"
        >
          <Select placeholder="选择告警状态">
            <Option value="all">全部状态</Option>
            <Option value="new">未处理</Option>
            <Option value="acknowledged">已确认</Option>
            <Option value="resolved">已解决</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="vin"
          label="车辆"
        >
          <Select 
            placeholder="选择车辆" 
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {vehicles.map(vehicle => (
              <Option key={vehicle.vin} value={vehicle.vin}>
                {vehicle.licensePlate} ({vehicle.model})
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          name="dateRange"
          label="时间范围"
        >
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AlertFilter;