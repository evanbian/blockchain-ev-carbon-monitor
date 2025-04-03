// src/components/Dashboard/DashboardPanel.tsx
import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Button, Progress, Space, Table, Tag, Typography } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  CarOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined,
  DashboardOutlined,
  LineChartOutlined,
  ApiOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './DashboardPanel.css';

const { Title, Text } = Typography;

// 模拟数据接口
interface DashboardData {
  vehicleSummary: {
    total: number;
    online: number;
    offline: number;
    error: number;
  };
  carbonSummary: {
    totalReduction: number;
    monthlyReduction: number;
    dailyAverage: number;
    previousMonthReduction: number;
    equivalentTrees: number;
  };
  blockchainSummary: {
    totalBlocks: number;
    totalTransactions: number;
    averageBlockTime: number;
    lastBlockTime: string;
  };
  recentVehicles: Array<{
    key: string;
    vin: string;
    licensePlate: string;
    model: string;
    status: string;
    lastUpdate: string;
    mileage: number;
  }>;
  recentTransactions: Array<{
    key: string;
    hash: string;
    type: string;
    time: string;
    status: string;
  }>;
  trendData: {
    labels: string[];
    carbonReduction: number[];
    credits: number[];
  };
}

const DashboardPanel: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<DashboardData | null>(null);

  // 模拟加载数据
  useEffect(() => {
    const fetchData = async () => {
      // 模拟API调用延迟
      setTimeout(() => {
        setData(generateMockData());
        setLoading(false);
      }, 1200);
    };

    fetchData();

    // 每30秒更新一次数据
    const intervalId = setInterval(() => {
      setData(prevData => {
        if (!prevData) return generateMockData();
        
        // 随机增加一些数值，模拟实时数据变化
        return {
          ...prevData,
          carbonSummary: {
            ...prevData.carbonSummary,
            totalReduction: prevData.carbonSummary.totalReduction + Math.random() * 5,
            dailyAverage: prevData.carbonSummary.dailyAverage + Math.random(),
          },
          blockchainSummary: {
            ...prevData.blockchainSummary,
            totalBlocks: prevData.blockchainSummary.totalBlocks + 1,
            totalTransactions: prevData.blockchainSummary.totalTransactions + Math.floor(Math.random() * 3),
            lastBlockTime: new Date().toLocaleTimeString(),
          }
        };
      });
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // 生成模拟数据
  const generateMockData = (): DashboardData => {
    return {
      vehicleSummary: {
        total: 15,
        online: 12,
        offline: 2,
        error: 1
      },
      carbonSummary: {
        totalReduction: 12584.2,
        monthlyReduction: 958.3,
        dailyAverage: 32.5,
        previousMonthReduction: 892.7,
        equivalentTrees: 629
      },
      blockchainSummary: {
        totalBlocks: 10483,
        totalTransactions: 42356,
        averageBlockTime: 12.5,
        lastBlockTime: new Date().toLocaleTimeString()
      },
      recentVehicles: [
        {
          key: '1',
          vin: 'LSVAU2180N2183294',
          licensePlate: '京A12345',
          model: '比亚迪汉EV',
          status: 'online',
          lastUpdate: '10分钟前',
          mileage: 128.5
        },
        {
          key: '2',
          vin: 'LNBSCCAK7JW217931',
          licensePlate: '京B54321',
          model: '特斯拉Model 3',
          status: 'offline',
          lastUpdate: '2小时前',
          mileage: 0
        },
        {
          key: '3',
          vin: 'WVWZZZ1KZAP035125',
          licensePlate: '京C98765',
          model: '蔚来ES6',
          status: 'error',
          lastUpdate: '35分钟前',
          mileage: 46.2
        }
      ],
      recentTransactions: [
        {
          key: '1',
          hash: '0x71c...8fe2',
          type: '数据上传',
          time: '2分钟前',
          status: 'confirmed'
        },
        {
          key: '2',
          hash: '0xb3a...97d5',
          type: '积分生成',
          time: '15分钟前',
          status: 'confirmed'
        },
        {
          key: '3',
          hash: '0x41f...1d24',
          type: '车辆注册',
          time: '1小时前',
          status: 'confirmed'
        }
      ],
      trendData: {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        carbonReduction: [32.5, 37.2, 31.5, 42.3, 38.6, 28.4, 33.7],
        credits: [1.62, 1.86, 1.57, 2.11, 1.93, 1.42, 1.68]
      }
    };
  };

  // 状态标签渲染
  const renderStatusTag = (status: string) => {
    let color = '';
    let text = '';
    
    switch (status) {
      case 'online':
        color = 'success';
        text = '在线';
        break;
      case 'offline':
        color = 'default';
        text = '离线';
        break;
      case 'error':
        color = 'error';
        text = '异常';
        break;
      case 'confirmed':
        color = 'success';
        text = '已确认';
        break;
      case 'pending':
        color = 'processing';
        text = '处理中';
        break;
      default:
        color = 'default';
        text = status;
    }
    
    return <Tag color={color}>{text}</Tag>;
  };

  // 车辆表格列定义
  const vehicleColumns = [
    {
      title: '车牌号',
      dataIndex: 'licensePlate',
      key: 'licensePlate',
      render: (text: string, record: any) => (
        <a onClick={() => navigate(`/admin/vehicles/view/${record.vin}`)}>{text}</a>
      )
    },
    {
      title: '车型',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => renderStatusTag(status)
    },
    {
      title: '最近行驶',
      dataIndex: 'mileage',
      key: 'mileage',
      render: (mileage: number) => (
        mileage > 0 ? `${mileage} km` : '-'
      )
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
    }
  ];

  // 交易表格列定义
  const transactionColumns = [
    {
      title: '交易哈希',
      dataIndex: 'hash',
      key: 'hash',
      render: (hash: string) => (
        <a onClick={() => navigate(`/display/explorer`)}>{hash}</a>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => renderStatusTag(status)
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
    }
  ];

  // 计算月度变化百分比
  const calculateMonthlyChange = (): number => {
    if (!data) return 0;
    const { monthlyReduction, previousMonthReduction } = data.carbonSummary;
    return ((monthlyReduction - previousMonthReduction) / previousMonthReduction) * 100;
  };

  // 计算在线率
  const calculateOnlineRate = (): number => {
    if (!data) return 0;
    const { total, online } = data.vehicleSummary;
    return (online / total) * 100;
  };

  if (loading || !data) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <Text>正在加载数据...</Text>
      </div>
    );
  }

  return (
    <div className="dashboard-panel">
      <div className="dashboard-header">
        <Title level={2}>系统概览</Title>
        <div>
          <Text type="secondary">实时数据更新于 {new Date().toLocaleString()}</Text>
        </div>
      </div>

      {/* 顶部卡片 */}
      <Row gutter={[16, 16]} className="dashboard-row">
        <Col xs={24} sm={24} md={8}>
          <Card className="stat-card carbon-card">
            <Statistic
              title={<span className="stat-title">碳减排总量</span>}
              value={data.carbonSummary.totalReduction}
              precision={1}
              valueStyle={{ color: '#3f8600' }}
              prefix={<EnvironmentOutlined />}
              suffix="kg"
            />
            <div className="card-footer">
              <Text>相当于种植 <Text strong>{data.carbonSummary.equivalentTrees}</Text> 棵树</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="stat-card vehicle-card">
            <Statistic
              title={<span className="stat-title">车辆总数</span>}
              value={data.vehicleSummary.total}
              valueStyle={{ color: '#1890ff' }}
              prefix={<CarOutlined />}
              suffix="辆"
            />
            <div className="card-footer">
              <div className="online-rate">
                <Text>在线率</Text>
                <Progress 
                  percent={calculateOnlineRate()} 
                  size="small" 
                  status="active" 
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="stat-card monthly-card">
            <Statistic
              title={<span className="stat-title">月减排量</span>}
              value={data.carbonSummary.monthlyReduction}
              precision={1}
              valueStyle={{ 
                color: calculateMonthlyChange() >= 0 ? '#3f8600' : '#cf1322' 
              }}
              prefix={calculateMonthlyChange() >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix="kg"
            />
            <div className="card-footer">
              <Text>
                较上月
                <Text 
                  type={calculateMonthlyChange() >= 0 ? "success" : "danger"}
                  strong
                >
                  {calculateMonthlyChange() >= 0 ? ' +' : ' '}
                  {calculateMonthlyChange().toFixed(1)}%
                </Text>
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 中间卡片 */}
      <Row gutter={[16, 16]} className="dashboard-row">
        <Col xs={24} sm={12} md={6}>
          <Card className="mini-stat-card">
            <div className="mini-stat">
              <div className="mini-stat-icon" style={{ background: '#e6f7ff', color: '#1890ff' }}>
                <DashboardOutlined />
              </div>
              <div className="mini-stat-content">
                <div className="mini-stat-title">日均减排</div>
                <div className="mini-stat-value">{data.carbonSummary.dailyAverage.toFixed(1)} kg</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="mini-stat-card">
            <div className="mini-stat">
              <div className="mini-stat-icon" style={{ background: '#f6ffed', color: '#52c41a' }}>
                <CarOutlined />
              </div>
              <div className="mini-stat-content">
                <div className="mini-stat-title">在线车辆</div>
                <div className="mini-stat-value">{data.vehicleSummary.online} 辆</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="mini-stat-card">
            <div className="mini-stat">
              <div className="mini-stat-icon" style={{ background: '#fff1f0', color: '#f5222d' }}>
                <ThunderboltOutlined />
              </div>
              <div className="mini-stat-content">
                <div className="mini-stat-title">异常车辆</div>
                <div className="mini-stat-value">{data.vehicleSummary.error} 辆</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="mini-stat-card">
            <div className="mini-stat">
              <div className="mini-stat-icon" style={{ background: '#f0f5ff', color: '#597ef7' }}>
                <ApiOutlined />
              </div>
              <div className="mini-stat-content">
                <div className="mini-stat-title">区块总数</div>
                <div className="mini-stat-value">{data.blockchainSummary.totalBlocks.toLocaleString()}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 底部表格 */}
      <Row gutter={[16, 16]} className="dashboard-row">
        <Col xs={24} md={12}>
          <Card 
            title={
              <div className="table-header">
                <CarOutlined /> 最近活跃车辆
              </div>
            } 
            extra={<Button type="link" onClick={() => navigate('/admin/vehicles')}>查看全部</Button>}
            className="table-card"
          >
            <Table 
              dataSource={data.recentVehicles} 
              columns={vehicleColumns} 
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            title={
              <div className="table-header">
                <LineChartOutlined /> 最近区块链交易
              </div>
            } 
            extra={<Button type="link" onClick={() => navigate('/display/explorer')}>区块浏览器</Button>}
            className="table-card"
          >
            <Table 
              dataSource={data.recentTransactions} 
              columns={transactionColumns} 
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* 快速访问按钮 */}
      <Row gutter={[16, 16]} className="dashboard-row action-row">
        <Col xs={24} sm={8}>
          <Button 
            type="primary" 
            size="large" 
            block 
            onClick={() => navigate('/analysis/carbon')}
            icon={<LineChartOutlined />}
          >
            碳减排分析
          </Button>
        </Col>
        <Col xs={24} sm={8}>
          <Button 
            type="default" 
            size="large" 
            block 
            onClick={() => navigate('/admin/vehicles')}
            icon={<CarOutlined />}
          >
            车辆管理
          </Button>
        </Col>
        <Col xs={24} sm={8}>
          <Button 
            type="default" 
            size="large" 
            block 
            onClick={() => navigate('/display/overview')}
            icon={<DashboardOutlined />}
          >
            展示平台
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPanel;