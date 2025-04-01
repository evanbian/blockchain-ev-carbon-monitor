// src/pages/Display/Explorer/index.tsx
import React, { useState } from 'react';
import { Card, Table, Input, Button, Tabs, Descriptions, Tag, Space, Typography } from 'antd';
import { SearchOutlined, BlockOutlined, SwapOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const BlockchainExplorer: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  
  // 模拟区块数据
  const blockData = Array.from({ length: 10 }).map((_, index) => ({
    key: 10000 - index,
    number: 10000 - index,
    hash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 10)}`,
    timestamp: new Date(Date.now() - index * 12000).toLocaleString(),
    transactions: Math.floor(Math.random() * 5) + 1,
    size: Math.floor(Math.random() * 5000) + 2000,
  }));
  
  // 模拟交易数据
  const transactionData = Array.from({ length: 10 }).map((_, index) => ({
    key: index,
    hash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 10)}`,
    from: `0x${Math.random().toString(16).substring(2, 10)}...`,
    to: `0x${Math.random().toString(16).substring(2, 10)}...`,
    blockNumber: 10000 - Math.floor(Math.random() * 10),
    timestamp: new Date(Date.now() - index * 30000).toLocaleString(),
    method: ['车辆注册', '数据上传', '积分生成', '积分转移'][Math.floor(Math.random() * 4)],
  }));
  
  const blockColumns = [
    {
      title: '区块号',
      dataIndex: 'number',
      key: 'number',
    },
    {
      title: '哈希',
      dataIndex: 'hash',
      key: 'hash',
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
    },
    {
      title: '交易数',
      dataIndex: 'transactions',
      key: 'transactions',
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => `${size} bytes`,
    },
  ];
  
  const txColumns = [
    {
      title: '交易哈希',
      dataIndex: 'hash',
      key: 'hash',
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: '区块',
      dataIndex: 'blockNumber',
      key: 'blockNumber',
    },
    {
      title: '发送方',
      dataIndex: 'from',
      key: 'from',
    },
    {
      title: '接收方',
      dataIndex: 'to',
      key: 'to',
    },
    {
      title: '方法',
      dataIndex: 'method',
      key: 'method',
      render: (text: string) => {
        let color = 'blue';
        if (text === '积分生成') color = 'green';
        if (text === '积分转移') color = 'purple';
        if (text === '数据上传') color = 'cyan';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
    },
  ];
  
  return (
    <div className="blockchain-explorer">
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>区块链浏览器</Title>
          <Space>
            <Input
              placeholder="搜索区块/交易/地址"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
            />
            <Button type="primary">搜索</Button>
          </Space>
        </div>
        
        <Descriptions size="small" bordered>
          <Descriptions.Item label="当前区块高度">{blockData[0].number}</Descriptions.Item>
          <Descriptions.Item label="链名称">新能源车辆碳减排私有链</Descriptions.Item>
          <Descriptions.Item label="共识机制">PoA</Descriptions.Item>
          <Descriptions.Item label="平均出块时间">12秒</Descriptions.Item>
          <Descriptions.Item label="智能合约数量">6</Descriptions.Item>
          <Descriptions.Item label="节点数量">4</Descriptions.Item>
        </Descriptions>
      </Card>
      
      <Tabs defaultActiveKey="blocks">
        <TabPane
          tab={<span><BlockOutlined /> 区块</span>}
          key="blocks"
        >
          <Card>
            <Table
              columns={blockColumns}
              dataSource={blockData}
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </TabPane>
        <TabPane
          tab={<span><SwapOutlined /> 交易</span>}
          key="transactions"
        >
          <Card>
            <Table
              columns={txColumns}
              dataSource={transactionData}
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default BlockchainExplorer;