// src/pages/Home/index.tsx
import React from 'react';
import { Row, Col, Typography, Card, Divider } from 'antd';
import DashboardPanel from '@/components/Dashboard/DashboardPanel';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      {/* 顶部介绍部分 */}
      <div style={{ textAlign: 'center', padding: '20px 0 40px' }}>
        <Title level={2}>新能源车辆碳减排计量系统</Title>
        <Paragraph style={{ fontSize: '16px', maxWidth: '800px', margin: '0 auto' }}>
          本系统旨在建立一个完整的新能源车辆碳减排监测和积分管理平台，
          基于区块链技术实现数据透明化、不可篡改，为绿色出行提供有力支持。
        </Paragraph>
      </div>

      {/* 仪表盘面板 */}
      <DashboardPanel />

      {/* 底部功能介绍 */}
      <Card style={{ marginTop: '24px', borderRadius: '8px' }}>
        <Divider orientation="left">系统主要功能</Divider>
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card 
              title="车辆行驶数据采集与上链" 
              bordered={false} 
              style={{ height: '100%' }}
            >
              实时采集新能源车辆行驶数据，包括里程、能耗、速度等信息，并通过智能合约将数据安全存储到区块链上，确保数据真实可靠、不可篡改。
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card 
              title="基于国标方法学的碳减排计算" 
              bordered={false}
              style={{ height: '100%' }}
            >
              采用符合国家标准的方法学，根据车辆实际行驶数据，精确计算替代传统燃油车后的碳减排量，为碳积分生成提供科学依据。
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card 
              title="碳积分生成与管理" 
              bordered={false}
              style={{ height: '100%' }}
            >
              基于区块链智能合约，将碳减排量转化为可信的碳积分，建立完整的积分生成、分配、流转和使用体系，支持绿色出行激励机制。
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card 
              title="数据分析与可视化展示" 
              bordered={false}
              style={{ height: '100%' }}
            >
              针对车辆行驶数据和碳减排效果进行多维度分析和可视化展示，包括趋势图、对比图、热力图等，支持决策者直观把握减排效果。
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card 
              title="区块链浏览和数据透明化" 
              bordered={false}
              style={{ height: '100%' }}
            >
              通过区块链浏览器，实现所有数据和交易的公开透明，任何利益相关方均可查询验证碳减排数据的真实性，提高系统公信力。
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card 
              title="异常监控与预警机制" 
              bordered={false}
              style={{ height: '100%' }}
            >
              建立完善的异常监控和预警机制，及时发现车辆数据异常、减排效果波动等情况，支持问题快速定位和解决，保障系统稳定运行。
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default HomePage;