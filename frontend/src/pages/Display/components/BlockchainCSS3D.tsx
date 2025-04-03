// src/pages/Display/components/BlockchainCSS3D.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Typography } from 'antd';
import { gsap } from 'gsap';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // 生成随机哈希
  const generateHash = () => {
    return '0x' + Array.from({ length: 10 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('') + '...';
  };
  
  // 添加新区块
  const addNewBlock = () => {
    // 计算新区块高度 - 修复: 确保从当前最新区块高度递增，而不是从状态变量
    const currentLatestBlock = blocks.length > 0 ? blocks[0] : null;
    const newBlockNumber = currentLatestBlock ? currentLatestBlock.height + 1 : latestBlockNumber + 1;
    
    const prevHash = blocks.length > 0 ? blocks[0].hash : '0x0000000000...';
    
    const newBlock: Block = {
      id: Date.now(),
      hash: generateHash(),
      prevHash: prevHash,
      timestamp: Date.now(),
      transactions: Math.floor(Math.random() * 5) + 1,
      height: newBlockNumber
    };
    
    // 更新区块列表
    setBlocks(prevBlocks => {
      const updatedBlocks = [newBlock, ...prevBlocks];
      if (updatedBlocks.length > 8) {
        updatedBlocks.pop();
      }
      return updatedBlocks;
    });
    
    // 更新最新区块高度状态
    setLatestBlockNumber(newBlockNumber);
  };
  
  // 生成初始区块数据
  useEffect(() => {
    const initialBlocks: Block[] = [];
    for (let i = 0; i < 5; i++) {
      const blockNumber = latestBlockNumber - i;
      const prevBlock = i > 0 ? initialBlocks[i-1] : null;
      
      initialBlocks.push({
        id: Date.now() - i * 1000,
        hash: generateHash(),
        prevHash: prevBlock ? prevBlock.hash : '0x0000000000...',
        timestamp: Date.now() - i * 12000,
        transactions: Math.floor(Math.random() * 5) + 1,
        height: blockNumber
      });
    }
    setBlocks(initialBlocks);
    
    // 定期生成新区块
    intervalRef.current = setInterval(() => {
      addNewBlock();
    }, 12000); // 约每12秒生成一个新区块
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 动画效果
  useEffect(() => {
    if (blocks.length > 0 && containerRef.current) {
      // 找到最新添加的区块元素
      const newBlockElement = containerRef.current.querySelector(`[data-block-id="${blocks[0].id}"]`);
      
      if (newBlockElement) {
        // 应用入场动画
        gsap.fromTo(
          newBlockElement,
          { 
            opacity: 0,
            x: -50,
            y: 0,
            rotateY: -90,
            scale: 0.5
          },
          { 
            opacity: 1,
            x: 0,
            y: 0,
            rotateY: 0,
            scale: 1,
            duration: 1,
            ease: "power2.out"
          }
        );
        
        // 移动其他区块
        const otherBlocks = Array.from(containerRef.current.querySelectorAll('.blockchain-block:not(:first-child)'));
        
        gsap.to(otherBlocks, {
          x: (index) => `+=${120}`,
          duration: 0.8,
          ease: "power1.inOut",
          stagger: 0.1
        });
      }
    }
  }, [blocks.length]); // 当区块数量变化时触发动画

  return (
    <div 
      className={`blockchain-css3d ${className || ''}`}
      style={{ 
        width: '100%', 
        height: '100%',
        background: 'linear-gradient(to right, #0f2027, #203a43, #2c5364)',
        borderRadius: '8px',
        overflow: 'hidden',
        perspective: '1000px',
        position: 'relative',
        ...style 
      }}
    >
      <div style={{ 
        position: 'absolute', 
        top: 16, 
        left: 16, 
        color: '#fff', 
        zIndex: 10, 
        fontWeight: 'bold',
        background: 'rgba(0, 118, 255, 0.3)',
        padding: '4px 12px',
        borderRadius: '6px'
      }}>
        当前区块高度: {blocks.length > 0 ? blocks[0].height : latestBlockNumber}
      </div>
      
      <div 
        ref={containerRef}
        style={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '40px',
          paddingLeft: '40px'
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'row-reverse',
          transformStyle: 'preserve-3d',
          transform: 'rotateX(20deg)'
        }}>
          {blocks.map((block, index) => (
            <div 
              key={block.id} 
              data-block-id={block.id}
              className="blockchain-block"
              style={{ 
                position: 'relative',
                marginRight: index > 0 ? '40px' : '0'
              }}
            >
              {/* 区块立方体 */}
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: index === 0 ? '#2E77E6' : '#37475D',
                  borderRadius: '10px',
                  position: 'relative',
                  transform: 'translateZ(20px)',
                  boxShadow: index === 0 
                    ? '0 0 20px rgba(46, 119, 230, 0.8)' 
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
                  backgroundColor: index === 0 ? '#1E5EB3' : '#2A3845',
                  transform: 'rotateY(90deg)',
                  transformOrigin: 'left center'
                }} />
                
                {/* 区块侧面 - 底部 */}
                <div style={{
                  position: 'absolute',
                  bottom: '-20px',
                  left: 0,
                  width: '80px',
                  height: '20px',
                  backgroundColor: index === 0 ? '#174A91' : '#1F2A35',
                  transform: 'rotateX(-90deg)',
                  transformOrigin: 'top center'
                }} />
              </div>
              
              {/* 区块信息 */}
              <div style={{
                position: 'absolute',
                top: '-70px',
                left: '0',
                width: '80px',
                backgroundColor: 'rgba(41, 60, 85, 0.8)',
                color: '#fff',
                padding: '5px',
                borderRadius: '5px',
                fontSize: '10px',
                transform: 'translateZ(30px)',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(64, 128, 255, 0.3)'
              }}>
                <div>哈希: {block.hash.substr(0, 8)}...</div>
                <div>交易数: {block.transactions}</div>
              </div>
              
              {/* 连接线 */}
              {index < blocks.length - 1 && (
                <div style={{
                  position: 'absolute',
                  left: '-40px',
                  top: '40px',
                  width: '40px',
                  height: '2px',
                  backgroundColor: '#4080FF',
                  transform: 'translateZ(20px)'
                }} />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* CSS 3D样式 */}
      <style>{`
        .blockchain-css3d {
          transform-style: preserve-3d;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50px) translateZ(20px); }
          to { opacity: 1; transform: translateX(0) translateZ(20px); }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
        
        .blockchain-block {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default BlockchainCSS3D;