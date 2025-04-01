// src/pages/Display/components/BlockchainCSS3D.tsx
import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

interface BlockchainCSS3DProps {
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
}

const BlockchainCSS3D: React.FC<BlockchainCSS3DProps> = ({
  style,
  className
}) => {
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
    const prevHash = blocks.length > 0 ? blocks[0].hash : '0x0000000000...';
    
    const newBlock: Block = {
      id: Date.now(),
      hash: generateHash(),
      prevHash: prevHash,
      timestamp: Date.now(),
      transactions: Math.floor(Math.random() * 5) + 1,
      height: newBlockNumber
    };
    
    setBlocks(prevBlocks => {
      const updatedBlocks = [newBlock, ...prevBlocks];
      if (updatedBlocks.length > 8) {
        updatedBlocks.pop();
      }
      return updatedBlocks;
    });
    
    setLatestBlockNumber(newBlockNumber);
  };
  
  // 生成初始区块数据
  useEffect(() => {
    const initialBlocks: Block[] = [];
    for (let i = 0; i < 5; i++) {
      const blockNumber = latestBlockNumber - i;
      initialBlocks.push({
        id: Date.now() - i * 1000,
        hash: generateHash(),
        prevHash: i > 0 ? initialBlocks[i-1]?.hash || generateHash() : '0x0000000000...',
        timestamp: Date.now() - i * 12000,
        transactions: Math.floor(Math.random() * 5) + 1,
        height: blockNumber
      });
    }
    setBlocks(initialBlocks);
    
    // 定期生成新区块
    const blockInterval = setInterval(() => {
      addNewBlock();
    }, 12000); // 约每12秒生成一个新区块
    
    return () => clearInterval(blockInterval);
  }, []);

  return (
    <div 
      className={`blockchain-css3d ${className || ''}`}
      style={{ 
        width: '100%', 
        height: '100%',
        background: 'linear-gradient(to right, #071a2f, #142d4c)',
        borderRadius: '8px',
        overflow: 'hidden',
        perspective: '1000px',
        position: 'relative',
        ...style 
      }}
    >
      <div style={{ position: 'absolute', top: 10, left: 10, color: '#fff', zIndex: 10 }}>
        当前区块高度: {latestBlockNumber}
      </div>
      
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transformStyle: 'preserve-3d',
        paddingTop: '40px'
      }}>
        <div style={{
          display: 'flex',
          transformStyle: 'preserve-3d',
          transform: 'rotateX(20deg)',
          padding: '20px'
        }}>
          {blocks.map((block, index) => (
            <div key={block.id} style={{ position: 'relative' }}>
              {/* 区块立方体 */}
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: index === 0 ? '#1890ff' : '#303030',
                  borderRadius: '10px',
                  marginRight: '40px',
                  position: 'relative',
                  transform: 'translateZ(20px)',
                  boxShadow: index === 0 
                    ? '0 0 20px rgba(24, 144, 255, 0.8)' 
                    : '0 0 10px rgba(0, 0, 0, 0.5)',
                  transition: 'all 0.5s ease-in-out',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {block.height}
                
                {/* 区块侧面 - 右侧 */}
                <div style={{
                  position: 'absolute',
                  right: '-20px',
                  top: 0,
                  width: '20px',
                  height: '80px',
                  backgroundColor: index === 0 ? '#1579d8' : '#252525',
                  transform: 'rotateY(90deg) translateZ(40px)',
                  transformOrigin: 'left center'
                }} />
                
                {/* 区块侧面 - 底部 */}
                <div style={{
                  position: 'absolute',
                  bottom: '-20px',
                  left: 0,
                  width: '80px',
                  height: '20px',
                  backgroundColor: index === 0 ? '#1266b9' : '#1a1a1a',
                  transform: 'rotateX(-90deg) translateZ(40px)',
                  transformOrigin: 'top center'
                }} />
              </div>
              
              {/* 区块信息 */}
              <div style={{
                position: 'absolute',
                top: '-70px',
                left: '0',
                width: '80px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: '#fff',
                padding: '5px',
                borderRadius: '5px',
                fontSize: '10px',
                transform: 'translateZ(30px)'
              }}>
                <div>哈希: {block.hash.substr(0, 8)}...</div>
                <div>交易数: {block.transactions}</div>
              </div>
              
              {/* 连接线 */}
              {index < blocks.length - 1 && (
                <div style={{
                  position: 'absolute',
                  right: '0',
                  top: '40px',
                  width: '40px',
                  height: '2px',
                  backgroundColor: '#1890ff',
                  transform: 'translateZ(20px)'
                }} />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* CSS 3D样式 */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50px) translateZ(20px); }
          to { opacity: 1; transform: translateX(0) translateZ(20px); }
        }
      `}</style>
    </div>
  );
};

export default BlockchainCSS3D;