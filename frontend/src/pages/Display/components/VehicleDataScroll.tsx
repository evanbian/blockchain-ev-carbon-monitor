// src/pages/Display/components/VehicleDataScroll.tsx
import React, { useState, useEffect } from 'react';
import { Table, Tag, Badge } from 'antd';
import { CarOutlined, ThunderboltOutlined } from '@ant-design/icons';

interface VehicleDataScrollProps {
  style?: React.CSSProperties;
  className?: string;
}

interface VehicleData {
  id: string;
  vin: string;
  licensePlate: string;
  model: string;
  status: 'driving' | 'idle' | 'charging' | 'parked';
  mileage: number;
  energy: number;
  carbonReduction: number;
  credits: number;
  timestamp: number;
  batteryLevel: number;
}

const VehicleDataScroll: React.FC<VehicleDataScrollProps> = ({
  style,
  className
}) => {
  const [data, setData] = useState<VehicleData[]>([]);
  
  // 生成模拟车辆数据
  const generateVehicleData = (count: number) => {
    const models = ['比亚迪汉EV', '特斯拉Model 3', '蔚来ES6', '小鹏P7', '理想ONE'];
    const statuses: Array<'driving' | 'idle' | 'charging' | 'parked'> = ['driving', 'idle', 'charging', 'parked'];
    
    return Array.from({ length: count }).map((_, index) => {
      const model = models[Math.floor(Math.random() * models.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const mileage = Math.round((status === 'driving' ? (5 + Math.random() * 30) : 0) * 10) / 10;
      const energy = Math.round((status === 'driving' ? (mileage * (0.15 + Math.random() * 0.05)) : 0) * 100) / 100;
      const carbonReduction = Math.round((mileage * 0.196 - energy * 0.854) * 100) / 100;
      const credits = Math.round(carbonReduction * 0.05 * 100) / 100;
      const batteryLevel = Math.floor(Math.random() * 100);
      
      return {
        id: `${index}`,
        vin: `LSVAU2180N2${1000 + index}`,
        licensePlate: `京${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${1000 + Math.floor(Math.random() * 9000)}`,
        model,
        status,
        mileage,
        energy,
        carbonReduction,
        credits,
        timestamp: Date.now() - Math.floor(Math.random() * 3600000),
        batteryLevel
      };
    });
  };
  
  // 初始化数据
  useEffect(() => {
    setData(generateVehicleData(15));
    
    // 每10秒更新数据，模拟实时数据更新
    const interval = setInterval(() => {
      setData(prev => {
        // 更新部分车辆的状态和数据
        return prev.map(vehicle => {
          if (Math.random() > 0.7) {
            // 70%的概率车辆状态不变
            return vehicle;
          }
          
          // 随机更新车辆状态
          const statuses: Array<'driving' | 'idle' | 'charging' | 'parked'> = ['driving', 'idle', 'charging', 'parked'];
          const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
          const mileage = Math.round((newStatus === 'driving' ? (5 + Math.random() * 30) : 0) * 10) / 10;
          const energy = Math.round((newStatus === 'driving' ? (mileage * (0.15 + Math.random() * 0.05)) : 0) * 100) / 100;
          const carbonReduction = Math.round((mileage * 0.196 - energy * 0.854) * 100) / 100;
          const credits = Math.round(carbonReduction * 0.05 * 100) / 100;
          
          return {
            ...vehicle,
            status: newStatus,
            mileage,
            energy,
            carbonReduction: carbonReduction > 0 ? carbonReduction : 0,
            credits: carbonReduction > 0 ? credits : 0,
            timestamp: Date.now(),
            batteryLevel: Math.max(10, Math.min(100, vehicle.batteryLevel + (newStatus === 'charging' ? 5 : newStatus === 'driving' ? -3 : -1)))
          };
        });
      });
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  const columns = [
    {
      title: '车辆信息',
      dataIndex: 'licensePlate',
      key: 'licensePlate',
      render: (text: string, record: VehicleData) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{record.model}</div>
        </div>
      ),
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: VehicleData) => {
        let color = '';
        let text = '';
        let icon = null;
        
        switch (status) {
          case 'driving':
            color = 'green';
            text = '行驶中';
            icon = <CarOutlined />;
            break;
          case 'idle':
            color = 'orange';
            text = '怠速';
            icon = <CarOutlined />;
            break;
          case 'charging':
            color = 'blue';
            text = '充电中';
            icon = <ThunderboltOutlined />;
            break;
          case 'parked':
            color = 'default';
            text = '停车';
            icon = <CarOutlined />;
            break;
        }
        
        return (
          <div>
            <Tag color={color} icon={icon}>{text}</Tag>
            <div style={{ marginTop: '5px' }}>
              <Badge status={record.batteryLevel > 80 ? 'success' : record.batteryLevel > 20 ? 'warning' : 'error'} text={`电量: ${record.batteryLevel}%`} />
            </div>
          </div>
        );
      },
      width: 120,
    },
    {
      title: '本次行驶',
      dataIndex: 'mileage',
      key: 'mileage',
      render: (mileage: number, record: VehicleData) => (
        <div>
          <div>{mileage.toFixed(1)} km</div>
          <div style={{ fontSize: '12px', color: '#999' }}>能耗: {record.energy.toFixed(2)} kWh</div>
        </div>
      ),
      width: 120,
    },
    {
      title: '碳减排',
      dataIndex: 'carbonReduction',
      key: 'carbonReduction',
      render: (reduction: number) => (
        <span style={{ color: reduction > 0 ? '#52c41a' : '#999' }}>
          {reduction > 0 ? `${reduction.toFixed(2)} kg` : '-'}
        </span>
      ),
      width: 100,
    },
    {
      title: '碳积分',
      dataIndex: 'credits',
      key: 'credits',
      render: (credits: number) => (
        <span style={{ color: credits > 0 ? '#1890ff' : '#999', fontWeight: credits > 0 ? 'bold' : 'normal' }}>
          {credits > 0 ? `+${credits.toFixed(2)}` : '-'}
        </span>
      ),
      width: 100,
    },
    {
      title: '更新时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: number) => (
        <span style={{ fontSize: '12px', color: '#999' }}>
          {new Date(timestamp).toLocaleTimeString()}
        </span>
      ),
      width: 100,
    }
  ];
  
  return (
    <div className={`vehicle-data-scroll ${className || ''}`} style={style}>
      <Table 
        dataSource={data} 
        columns={columns} 
        rowKey="id"
        pagination={false}
        size="small"
        scroll={{ y: 310 }}
      />
    </div>
  );
};

export default VehicleDataScroll;