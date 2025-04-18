// src/pages/Admin/Vehicle/VehicleList.tsx
import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Tag, Input, Card, message, Popconfirm, Tooltip } from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ImportOutlined,
  EyeOutlined,
  ReloadOutlined,
  BugOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchVehiclesStart, fetchVehiclesSuccess, fetchVehiclesFailure } from '@/store/slices/vehicleSlice';
import vehicleAPI from '@/services/vehicles';
import { Vehicle } from '@/types/vehicle';
import VehicleImport from './VehicleImport';

const VehicleList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { vehicles, loading, error } = useAppSelector(state => state.vehicles);
  
  const [searchText, setSearchText] = useState('');
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);
  
  useEffect(() => {
    loadVehicles();
  }, []);
  
  useEffect(() => {
    if (vehicles) {
      const filtered = vehicles.filter(vehicle => 
        vehicle.vin?.toLowerCase().includes(searchText.toLowerCase()) ||
        vehicle.licensePlate?.toLowerCase().includes(searchText.toLowerCase()) ||
        vehicle.model?.toLowerCase().includes(searchText.toLowerCase())
      ) as Vehicle[];
      setFilteredVehicles(filtered);
    }
  }, [searchText, vehicles]);
  
  const loadVehicles = async () => {
    try {
      console.log("开始加载车辆数据...");
      setLoading(true);
      dispatch(fetchVehiclesStart());
      
      // 使用真实API调用
      const response = await vehicleAPI.getVehicles({
        page: 1,
        size: 50,
        status: 'all'
      });
      
      console.log("API原始响应:", response);
      
      // 检查响应格式并适当处理
      let vehiclesData: Vehicle[] = [];
      
      if (response && response.data) {
        console.log("API响应data部分:", response.data);
        
        if (response.data.items && Array.isArray(response.data.items)) {
          vehiclesData = response.data.items.map((vehicle: Partial<Vehicle>) => ({
            ...vehicle,
            productionYear: vehicle.productionYear || 0,
            batteryCapacity: vehicle.batteryCapacity || 0,
            maxRange: vehicle.maxRange || 0,
            registerDate: vehicle.registerDate || new Date().toISOString(),
            lastUpdateTime: vehicle.lastUpdateTime || new Date().toISOString(),
            totalMileage: vehicle.totalMileage || 0,
            totalEnergy: vehicle.totalEnergy || 0,
            totalCarbonReduction: vehicle.totalCarbonReduction || 0,
            carbonCredits: vehicle.carbonCredits || 0
          })) as Vehicle[];
          console.log("从items数组中提取车辆数据, 数量:", vehiclesData.length);
        } else if (Array.isArray(response.data)) {
          vehiclesData = response.data.map((vehicle: Partial<Vehicle>) => ({
            ...vehicle,
            productionYear: vehicle.productionYear || 0,
            batteryCapacity: vehicle.batteryCapacity || 0,
            maxRange: vehicle.maxRange || 0,
            registerDate: vehicle.registerDate || new Date().toISOString(),
            lastUpdateTime: vehicle.lastUpdateTime || new Date().toISOString(),
            totalMileage: vehicle.totalMileage || 0,
            totalEnergy: vehicle.totalEnergy || 0,
            totalCarbonReduction: vehicle.totalCarbonReduction || 0,
            carbonCredits: vehicle.carbonCredits || 0
          })) as Vehicle[];
          console.log("将response.data作为车辆数组, 数量:", vehiclesData.length);
        } else {
          console.warn("无法识别的数据格式:", response.data);
        }
      } else {
        console.warn("API响应中没有data属性");
      }
      
      console.log("最终处理的车辆数据:", vehiclesData);
      
      dispatch(fetchVehiclesSuccess(vehiclesData));
      setLoading(false);
      
      // 显示车辆数量
      if (vehiclesData.length === 0) {
        message.info('没有查询到车辆数据');
      } else {
        message.success(`已加载 ${vehiclesData.length} 条车辆数据`);
      }
      
    } catch (error) {
      console.error("加载车辆数据失败:", error);
      dispatch(fetchVehiclesFailure(error instanceof Error ? error.message : 'Unknown error'));
      message.error('加载车辆数据失败');
      setLoading(false);
    }
  };
  
  const loadVehiclesDirectly = async () => {
    try {
      setLoading(true);
      console.log("直接从数据库加载所有车辆数据...");
      
      const url = `${vehicleAPI.baseUrl}/v1/vehicles/debug/all`;
      console.log("调用URL:", url);
      
      // 使用fetch API直接调用，绕过拦截器
      const response = await fetch(url);
      const data = await response.json();
      
      console.log("直接API调用响应:", data);
      
      if (data && data.success && data.data) {
        console.log("获取到车辆数据:", data.data);
        dispatch(fetchVehiclesSuccess(data.data));
        
        if (data.data.length === 0) {
          message.info('数据库中没有车辆数据');
        } else {
          message.success(`直接加载了 ${data.data.length} 条车辆数据`);
        }
      } else {
        console.warn("API返回无效数据格式:", data);
        message.warning('API返回格式异常');
      }
      
      setLoading(false);
    } catch (error) {
      console.error("直接加载失败:", error);
      message.error('直接加载车辆数据失败');
      setLoading(false);
    }
  };
  
  const handleDelete = async (vin: string) => {
    try {
      // 实际项目中应该使用API调用
      await vehicleAPI.deleteVehicle(vin);
      message.success('删除成功');
      loadVehicles();
    } catch (error) {
      message.error('删除失败');
    }
  };
  
  const handleEdit = (vin: string) => {
    navigate(`/admin/vehicles/edit/${vin}`);
  };
  
  const handleAdd = () => {
    navigate('/admin/vehicles/add');
  };
  
  const handleView = (vin: string) => {
    navigate(`/admin/vehicles/view/${vin}`);
  };
  
  const showImportModal = () => {
    setImportModalVisible(true);
  };
  
  const handleImportSuccess = () => {
    message.success('批量导入成功');
    loadVehicles();
  };
  
  const statusColors = {
    online: 'success',
    offline: 'default',
    error: 'error'
  };
  
  const columns = [
    {
      title: 'VIN码',
      dataIndex: 'vin',
      key: 'vin',
      render: (text: string) => <a onClick={() => handleView(text)}>{text}</a>,
    },
    {
      title: '车型',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: '车牌号',
      dataIndex: 'licensePlate',
      key: 'licensePlate',
    },
    {
      title: '制造商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
    },
    {
      title: '电池容量(kWh)',
      dataIndex: 'batteryCapacity',
      key: 'batteryCapacity',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status as keyof typeof statusColors] || 'default'}>
          {status === 'online' ? '在线' : status === 'offline' ? '离线' : '异常'}
        </Tag>
      ),
    },
    {
      title: '总减排量(kg)',
      dataIndex: 'totalCarbonReduction',
      key: 'totalCarbonReduction',
      render: (value: number) => value ? value.toFixed(2) : '0.00',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Vehicle) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record.vin)}
          />
          <Popconfirm
            title="确定要删除此车辆吗?"
            onConfirm={() => handleDelete(record.vin)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  
  return (
    <Card
      title="车辆管理"
      extra={
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            添加车辆
          </Button>
          <Button
            icon={<ImportOutlined />}
            onClick={showImportModal}
          >
            批量导入
          </Button>
          <Tooltip title="刷新">
            <Button
              icon={<ReloadOutlined />}
              onClick={loadVehicles}
              loading={isLoading}
            />
          </Tooltip>
          <Tooltip title="调试">
            <Button
              type="dashed"
              icon={<BugOutlined />}
              onClick={loadVehiclesDirectly}
              loading={isLoading}
            >
              调试加载
            </Button>
          </Tooltip>
        </Space>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索车辆 (VIN码/车牌/车型)"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <div style={{ marginTop: 8 }}>
          {loading ? '加载中...' : `共 ${filteredVehicles.length} 辆车`}
        </div>
      </div>
      
      <Table
        columns={columns}
        dataSource={filteredVehicles}
        rowKey="vin"
        loading={loading}
        pagination={{ 
          defaultPageSize: 10, 
          showSizeChanger: true, 
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `共 ${total} 辆车`
        }}
      />
      
      <VehicleImport
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        onSuccess={handleImportSuccess}
      />
    </Card>
  );
};

export default VehicleList;