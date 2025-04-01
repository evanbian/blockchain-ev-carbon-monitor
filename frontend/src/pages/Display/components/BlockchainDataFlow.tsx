// src/pages/Display/components/BlockchainDataFlow.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

interface BlockchainDataFlowProps {
  style?: React.CSSProperties;
  className?: string;
}

interface Block {
  id: number;
  hash: string;
  prevHash: string;
  timestamp: number;
  transactions: number;
  height: number;
  position: {
    x: number;
    y: number;
  };
}

const BlockchainDataFlow: React.FC<BlockchainDataFlowProps> = ({
  style,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [latestBlockNumber, setLatestBlockNumber] = useState(10000);
  
  // 生成随机哈希
  const generateHash = () => {
    return '0x' + Array.from({ length: 10 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('') + '...';
  };
  
  // 添加新区块
  const addNewBlock = () => {
    const newBlockNumber = latestBlockNumber + 1;
    
    // 获取前一个区块的哈希值
    const prevHash = blocks.length > 0 ? blocks[0].hash : '0x0000000000...';
    
    // 创建新区块
    const newBlock: Block = {
      id: Date.now(), // 唯一ID，用于React key
      hash: generateHash(),
      prevHash: prevHash,
      timestamp: Date.now(),
      transactions: Math.floor(Math.random() * 5) + 1,
      height: newBlockNumber,
      position: {
        x: 50, // 初始位置居中
        y: 0   // 顶部
      }
    };
    
    // 更新状态
    setBlocks(prevBlocks => {
      // 限制显示的区块数量，移除最老的区块
      const updatedBlocks = [newBlock, ...prevBlocks];
      if (updatedBlocks.length > 8) {
        updatedBlocks.pop();
      }
      return updatedBlocks;
    });
    
    setLatestBlockNumber(newBlockNumber);
  };
  
  // 区块生成逻辑
  useEffect(() => {
    // 初始区块
    const initialBlocks: Block[] = [];
    for (let i = 0; i < 5; i++) {
      const blockNumber = latestBlockNumber - i;
      initialBlocks.push({
        id: Date.now() - i * 1000,
        hash: generateHash(),
        prevHash: i > 0 ? initialBlocks[i-1]?.hash || generateHash() : '0x0000000000...',
        timestamp: Date.now() - i * 12000,
        transactions: Math.floor(Math.random() * 5) + 1,
        height: blockNumber,
        position: {
          x: 50,
          y: 80 + i * 70 // 垂直排列
        }
      });
    }
    setBlocks(initialBlocks);
    
    // 定期生成新区块
    const blockInterval = setInterval(() => {
      addNewBlock();
    }, 12000); // 约每12秒生成一个新区块
    
    return () => clearInterval(blockInterval);
  }, []);
  
  // 渲染区块链
  return (
    <div 
      ref={containerRef}
      className={`blockchain-data-flow ${className || ''}`}
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative',
        background: 'linear-gradient(to top, #071a2f, #142d4c)',
        borderRadius: '8px',
        overflow: 'hidden',
        padding: '10px',
        ...style 
      }}
    >
      <div style={{ 
        position: 'absolute', 
        top: 10, 
        left: 10, 
        color: '#fff',
        opacity: 0.7
      }}>
        <Text style={{ color: '#fff' }}>当前区块高度: {latestBlockNumber}</Text>
      </div>
      
      {/* 区块链可视化 */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: '40px'
      }}>
        {blocks.map((block, index) => (
          <div 
            key={block.id} 
            className="blockchain-block"
            style={{
              width: '80%',
              padding: '10px',
              margin: '5px 0',
              backgroundColor: index === 0 ? 'rgba(24, 144, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
              borderLeft: index === 0 ? '4px solid #1890ff' : '4px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '12px',
              animation: index === 0 ? 'fadeIn 1s' : 'none',
              position: 'relative',
              boxShadow: index === 0 ? '0 0 15px rgba(24, 144, 255, 0.5)' : 'none'
            }}
          >
            <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>
              区块 #{block.height}
              {index === 0 && (
                <span style={{ 
                  marginLeft: '10px', 
                  padding: '2px 5px', 
                  backgroundColor: '#1890ff', 
                  borderRadius: '3px',
                  fontSize: '10px'
                }}>最新</span>
              )}
            </div>
            <div>哈希: {block.hash}</div>
            <div>前区块哈希: {block.prevHash}</div>
            <div>交易数: {block.transactions}</div>
            <div>时间: {new Date(block.timestamp).toLocaleTimeString()}</div>
            
            {/* 连接线 - 连接到下一个区块 */}
            {index < blocks.length - 1 && (
              <div style={{
                position: 'absolute',
                bottom: '-9px',
                left: '50%',
                width: '2px',
                height: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                zIndex: 1
              }}></div>
            )}
          </div>
        ))}
      </div>
      
      {/* 添加CSS动画 */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default BlockchainDataFlow;