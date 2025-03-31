// src/pages/Admin/Vehicle/VehicleForm.tsx
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, InputNumber, Card, Row, Col, message, Select } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import vehicleAPI from '@/services/vehicles';
import { Vehicle } from '@/types/vehicle';

const { Option } = Select;

interface VehicleFormProps {
  mode: 'add' | 'edit';
}

const VehicleForm: React.FC<VehicleFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { vin } = useParams<{ vin: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (mode === 'edit' && vin) {
      loadVehicle(vin);
    }
  }, [mode, vin]);
  
  const loadVehicle = async (vinCode: string) => {
    try {
      setLoading(true);
      // 实际项目中应该使用API调用
      const response = await vehicleAPI.getVehicleById(vinCode);
      form.setFieldsValue(response.data);
    } catch (error) {
      message.error('加载车辆数据失败');
    } finally {
      setLoading(false);
    }
  };
      
  //     // 使用模拟数据
  //     const mockData = {
  //       vin: "LSVAU2180N2183294",
  //       model: "比亚迪汉EV",
  //       licensePlate: "京A12345",
  //       manufacturer: "比亚迪",
  //       productionYear: 2022,
  //       batteryCapacity: 76.9,
  //       maxRange: 605,
  //       registerDate: "2022-06-15",
  //       status: "online"
  //     };
      
  //     form.setFieldsValue(mockData);
  //   } catch (error) {
  //     message.error('加载车辆数据失败');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      if (mode === 'add') {
        // 实际项目中应该使用API调用
        // await vehicleAPI.createVehicle(values);
        await vehicleAPI.createVehicle(values);
        message.success('车辆添加成功');
        // message.success('车辆添加成功');
      } else {
        // 实际项目中应该使用API调用
        // await vehicleAPI.updateVehicle(vin as string, values);
        await vehicleAPI.updateVehicle(vin as string, values);
        message.success('车辆更新成功');
        // message.success('车辆更新成功');
      }
      
      navigate('/admin/vehicles');
    } catch (error) {
      message.error(mode === 'add' ? '添加失败' : '更新失败');
    } finally {
      setLoading(false);
    }
  };
  
  const manufacturerOptions = [
    { label: '比亚迪', value: '比亚迪' },
    { label: '特斯拉', value: '特斯拉' },
    { label: '蔚来', value: '蔚来' },
    { label: '小鹏', value: '小鹏' },
    { label: '理想', value: '理想' },
    { label: '其他', value: '其他' }
  ];
  
  return (
    <Card
      title={mode === 'add' ? '添加车辆' : '编辑车辆信息'}
      extra={
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/vehicles')}>
          返回列表
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          status: 'online',
          productionYear: new Date().getFullYear()
        }}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="vin"
              label="VIN码"
              rules={[
                { required: true, message: '请输入车辆VIN码' },
                { pattern: /^[A-HJ-NPR-Z0-9]{17}$/, message: 'VIN码格式不正确' }
              ]}
            >
              <Input placeholder="请输入17位车辆识别码" maxLength={17} disabled={mode === 'edit'} />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="licensePlate"
              label="车牌号"
              rules={[
                { required: true, message: '请输入车牌号' },
                { pattern: /^[\u4e00-\u9fa5][A-Z][A-Z0-9]{5}$/, message: '车牌号格式不正确' }
              ]}
            >
              <Input placeholder="请输入车牌号，如：京A12345" />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="model"
              label="车型"
              rules={[{ required: true, message: '请输入车型' }]}
            >
              <Input placeholder="请输入车型" />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="manufacturer"
              label="制造商"
              rules={[{ required: true, message: '请选择制造商' }]}
            >
              <Select
                placeholder="请选择制造商"
                options={manufacturerOptions}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item
              name="productionYear"
              label="生产年份"
              rules={[{ required: true, message: '请输入生产年份' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={2000}
                max={new Date().getFullYear()}
                placeholder="请输入生产年份"
              />
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item
              name="batteryCapacity"
              label="电池容量(kWh)"
              rules={[{ required: true, message: '请输入电池容量' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={1}
                step={0.1}
                placeholder="请输入电池容量"
              />
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item
              name="maxRange"
              label="最大续航里程(km)"
              rules={[{ required: true, message: '请输入最大续航里程' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={0}
                placeholder="请输入最大续航里程"
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择车辆状态' }]}
            >
              <Select placeholder="请选择车辆状态">
                <Option value="online">在线</Option>
                <Option value="offline">离线</Option>
                <Option value="error">异常</Option>
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="registerDate"
              label="注册日期"
              rules={[{ required: true, message: '请输入注册日期' }]}
            >
              <Input type="date" />
            </Form.Item>
          </Col>
        </Row>
        
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<SaveOutlined />}
            style={{ marginRight: 16 }}
          >
            {mode === 'add' ? '添加车辆' : '保存修改'}
          </Button>
          <Button onClick={() => navigate('/admin/vehicles')}>
            取消
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default VehicleForm;
