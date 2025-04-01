// src/pages/Display/Overview/index.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Space } from 'antd';
import { ArrowUpOutlined, ThunderboltOutlined, EnvironmentOutlined } from '@ant-design/icons';
import VehicleHeatMap from '../components/VehicleHeatMap';
import BlockchainDataFlow from '../components/BlockchainDataFlow';
import VehicleDataScroll from '../components/VehicleDataScroll';

const { Title, Text } = Typography;

const DisplayOverview: React.FC = () => {
  // 模拟数据 - 后续会从API获取
  const [totalCredits, setTotalCredits] = useState(42569.0);
  const [issuedToday, setIssuedToday] = useState(387.2);
  const [vehicleCount, setVehicleCount] = useState(15);
  const [onlineVehicles, setOnlineVehicles] = useState(12);
  const [totalReduction, setTotalReduction] = useState(127720.5);
  const [treesEquivalent, setTreesEquivalent] = useState(6386);
  
  // 模拟实时数据更新
  useEffect(() => {
    const timer = setInterval(() => {
      // 每3秒增加一些随机数值，模拟实时数据流入
      setTotalCredits(prev => {
        const newValue = prev + Math.random() * 0.5;
        return Math.round(newValue * 10) / 10; // 保留一位小数
      });
      
      setIssuedToday(prev => {
        const newValue = prev + Math.random() * 0.2;
        return Math.round(newValue * 10) / 10; // 保留一位小数
      });
      
      setTotalReduction(prev => {
        const newValue = prev + Math.random() * 1.5;
        return Math.round(newValue * 10) / 10; // 保留一位小数
      });
    }, 3000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="display-overview">
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card 
            bordered={false} 
            className="stat-card"
            style={{ 
              height: 200, 
              background: 'linear-gradient(120deg, #1890ff, #52c41a)',
              color: 'white',
              borderRadius: '10px',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <Title level={4} style={{ color: 'white', margin: 0 }}>总碳积分</Title>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginTop: 30,
              position: 'relative',
              zIndex: 2
            }}>
              <ArrowUpOutlined style={{ 
                color: 'white', 
                marginRight: 8, 
                fontSize: 24, 
                background: 'rgba(255,255,255,0.2)',
                padding: 8,
                borderRadius: '50%'
              }} />
              <span style={{ fontSize: 48, fontWeight: 'bold', color: 'white' }}>
                {totalCredits.toFixed(1)}
              </span>
            </div>
            <div style={{ 
              marginTop: 16, 
              textAlign: 'center',
              position: 'relative',
              zIndex: 2
            }}>
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>今日新增: </Text>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>{issuedToday.toFixed(1)}</Text>
            </div>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              transform: 'translate(40%, -40%)'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              transform: 'translate(-40%, 40%)'
            }}></div>
          </Card>
        </Col>
        <Col span={8}>
          <Card 
            bordered={false} 
            className="stat-card"
            style={{ 
              height: 200, 
              background: 'linear-gradient(120deg, #722ed1, #eb2f96)',
              color: 'white',
              borderRadius: '10px',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <Title level={4} style={{ color: 'white', margin: 0 }}>碳减排总量</Title>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginTop: 30,
              position: 'relative',
              zIndex: 2
            }}>
              <ThunderboltOutlined style={{ 
                color: 'white', 
                marginRight: 8, 
                fontSize: 24, 
                background: 'rgba(255,255,255,0.2)',
                padding: 8,
                borderRadius: '50%'
              }} />
              <span style={{ fontSize: 48, fontWeight: 'bold', color: 'white' }}>
                {totalReduction.toFixed(1)}
              </span>
              <span style={{ fontSize: 20, marginLeft: 8, color: 'white' }}>kg</span>
            </div>
            <div style={{ 
              marginTop: 16, 
              textAlign: 'center',
              position: 'relative',
              zIndex: 2
            }}>
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>相当于种植 </Text>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>{treesEquivalent}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}> 棵树</Text>
            </div>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              transform: 'translate(40%, -40%)'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              transform: 'translate(-40%, 40%)'
            }}></div>
          </Card>
        </Col>
        <Col span={8}>
          <Card 
            bordered={false} 
            className="stat-card"
            style={{ 
              height: 200, 
              background: 'linear-gradient(120deg, #fa8c16, #faad14)',
              color: 'white',
              borderRadius: '10px',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <Title level={4} style={{ color: 'white', margin: 0 }}>接入车辆数</Title>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginTop: 30,
              position: 'relative',
              zIndex: 2
            }}>
              <EnvironmentOutlined style={{ 
                color: 'white', 
                marginRight: 8, 
                fontSize: 24, 
                background: 'rgba(255,255,255,0.2)',
                padding: 8,
                borderRadius: '50%'
              }} />
              <span style={{ fontSize: 48, fontWeight: 'bold', color: 'white' }}>
                {vehicleCount}
              </span>
              <span style={{ fontSize: 20, marginLeft: 8, color: 'white' }}>辆</span>
            </div>
            <div style={{ 
              marginTop: 16, 
              textAlign: 'center',
              position: 'relative',
              zIndex: 2
            }}>
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>在线车辆: </Text>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>{onlineVehicles}</Text>
            </div>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              transform: 'translate(40%, -40%)'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              transform: 'translate(-40%, 40%)'
            }}></div>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={16}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ 
                  width: 4, 
                  height: 16, 
                  background: '#1890ff', 
                  display: 'inline-block', 
                  marginRight: 8,
                  borderRadius: 2
                }}></span>
                <span>雄安新区车辆分布热图</span>
              </div>
            }
            bordered={false}
            style={{ 
              height: 400, 
              borderRadius: '10px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
            }}
          >
            <VehicleHeatMap style={{ height: 330 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ 
                  width: 4, 
                  height: 16, 
                  background: '#722ed1', 
                  display: 'inline-block', 
                  marginRight: 8,
                  borderRadius: 2
                }}></span>
                <span>区块链数据流</span>
              </div>
            }
            bordered={false}
            style={{ 
              height: 400, 
              borderRadius: '10px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
            }}
          >
            <BlockchainDataFlow style={{ height: 330 }} />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ 
                  width: 4, 
                  height: 16, 
                  background: '#52c41a', 
                  display: 'inline-block', 
                  marginRight: 8,
                  borderRadius: 2
                }}></span>
                <span>车辆实时数据</span>
              </div>
            }
            bordered={false}
            style={{ 
              borderRadius: '10px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
            }}
          >
            <VehicleDataScroll />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DisplayOverview;