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
  ReloadOutlined
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
  
  useEffect(() => {
    loadVehicles();
  }, []);
  
  useEffect(() => {
    if (vehicles) {
      setFilteredVehicles(
        vehicles.filter(vehicle => 
          vehicle.vin.toLowerCase().includes(searchText.toLowerCase()) ||
          vehicle.licensePlate.toLowerCase().includes(searchText.toLowerCase()) ||
          vehicle.model.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }
  }, [searchText, vehicles]);
  
  const loadVehicles = async () => {
    try {
      dispatch(fetchVehiclesStart());
      // 在实际连接API前使用模拟数据
      const mockData: Vehicle[] = [
        {
          vin: "LSVAU2180N2183294",
          model: "比亚迪汉EV",
          licensePlate: "京A12345",
          manufacturer: "比亚迪",
          productionYear: 2022,
          batteryCapacity: 76.9,
          maxRange: 605,
          registerDate: "2022-06-15",
          status: "online",
          lastUpdateTime: "2023-07-01T12:30:45Z",
          totalMileage: 12500,
          totalEnergy: 2300,
          totalCarbonReduction: 3750.5,
          carbonCredits: 187.5
        },
        {
          vin: "LNBSCCAK7JW217931",
          model: "特斯拉Model 3",
          licensePlate: "京B54321",
          manufacturer: "特斯拉",
          productionYear: 2022,
          batteryCapacity: 60.0,
          maxRange: 550,
          registerDate: "2022-04-20",
          status: "offline",
          lastUpdateTime: "2023-06-28T09:15:30Z",
          totalMileage: 9800,
          totalEnergy: 1750,
          totalCarbonReduction: 2940.2,
          carbonCredits: 147.0
        },
        {
          vin: "WVWZZZ1KZAP035125",
          model: "蔚来ES6",
          licensePlate: "京C98765",
          manufacturer: "蔚来",
          productionYear: 2021,
          batteryCapacity: 70.0,
          maxRange: 510,
          registerDate: "2021-11-10",
          status: "online",
          lastUpdateTime: "2023-06-30T16:45:12Z",
          totalMileage: 15200,
          totalEnergy: 2800,
          totalCarbonReduction: 4560.8,
          carbonCredits: 228.0
        }
      ];
      
      // 实际项目中应该使用API调用
      // const response = await vehicleAPI.getVehicles({});
      // const data = response.data.items;
      
      dispatch(fetchVehiclesSuccess(mockData));
    } catch (error) {
      dispatch(fetchVehiclesFailure(error instanceof Error ? error.message : 'Unknown error'));
      message.error('加载车辆数据失败');
    }
  };
  
  const handleDelete = async (vin: string) => {
    try {
      // 实际项目中应该使用API调用
      // await vehicleAPI.deleteVehicle(vin);
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
      render: (value: number) => value.toFixed(2),
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
            />
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
