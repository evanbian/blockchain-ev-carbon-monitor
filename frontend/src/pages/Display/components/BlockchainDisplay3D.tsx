// src/pages/Display/components/BlockchainDisplay3D.tsx
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Line, Html } from '@react-three/drei';
import { Vector3, Mesh } from 'three';

interface Block {
  id: number;
  hash: string;
  prevHash: string;
  timestamp: number;
  transactions: number;
  height: number;
}

interface BlockchainDisplay3DProps {
  style?: React.CSSProperties;
  className?: string;
}

interface Block3DProps {
  block: Block;
  index: number;
  totalBlocks: number;
}

// 改进的三维区块组件
const Block3D = ({ block, index, totalBlocks }: Block3DProps) => {
  const boxRef = useRef<Mesh>(null);
  const [position] = useState(new Vector3(index * 4.5, 0, 0));
  
  // 添加轻微的上下浮动动画
  useFrame(({ clock }) => {
    if (boxRef.current) {
      const y = Math.sin(clock.getElapsedTime() + index) * 0.05;
      boxRef.current.position.y = y;
    }
  });
  
  return (
    <group position={position}>
      {/* 区块立方体 */}
      <Box 
        ref={boxRef}
        args={[2, 1, 0.5]} 
      >
        <meshStandardMaterial 
          color={index === 0 ? "#2B85E4" : "#2C3E50"} 
          metalness={0.8}
          roughness={0.2}
          emissive={index === 0 ? "#1A5FB4" : "#1A2634"}
          emissiveIntensity={0.8}
        />
      </Box>
      
      {/* 区块信息 HTML 覆盖层 */}
      <Html position={[0, 1.7, 0]} center style={{ color: '#fff', pointerEvents: 'none' }}>
        <div style={{ 
          background: 'linear-gradient(180deg, rgba(43,133,228,0.9) 0%, rgba(26,95,180,0.8) 100%)', 
          padding: '10px 15px', 
          borderRadius: '8px',
          fontSize: '12px',
          textAlign: 'left',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ color: '#fff', marginBottom: '6px', fontWeight: 'bold' }}>区块 #{block.height}</div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '11px', marginBottom: '4px' }}>交易数: {block.transactions}</div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '11px' }}>
            时间: {new Date(block.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </Html>
      
      {/* 区块链连接线 */}
      {index < totalBlocks - 1 && (
        <>
          <Line 
            points={[
              new Vector3(1.1, 0, 0),
              new Vector3(2.2, 0, 0),
              new Vector3(3.3, 0, 0)
            ]} 
            color="#2B85E4"
            lineWidth={1.5}
          />
          <mesh position={[2.2, 0, 0]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#2B85E4" emissive="#1A5FB4" emissiveIntensity={1} />
          </mesh>
        </>
      )}
    </group>
  );
};

// 区块链显示组件
const BlockchainDisplay3D: React.FC<BlockchainDisplay3DProps> = ({
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
  
  // 添加新区块的动画效果
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
    
    // 使用不可变更新模式更新状态
    setBlocks(prevBlocks => {
      const updatedBlocks = [newBlock, ...prevBlocks];
      if (updatedBlocks.length > 5) { // 只保留5个区块以保持性能
        updatedBlocks.length = 5;
      }
      return updatedBlocks;
    });
    
    setLatestBlockNumber(newBlockNumber);
  };
  
  // 初始化区块
  useEffect(() => {
    const initialBlocks: Block[] = [];
    for (let i = 0; i < 3; i++) { // 初始化3个区块
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
  }, []);
  
  // 定期生成新区块
  useEffect(() => {
    const blockInterval = setInterval(() => {
      addNewBlock();
    }, 8000); // 每8秒生成一个新区块
    
    return () => clearInterval(blockInterval);
  }, []);

  return (
    <div 
      className={`blockchain-display-3d ${className || ''}`}
      style={{ 
        width: '100%', 
        height: '100%',
        background: 'linear-gradient(to right, #0A2744, #1C4B82)',
        borderRadius: '8px',
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
        background: 'linear-gradient(180deg, rgba(43,133,228,0.9) 0%, rgba(26,95,180,0.8) 100%)',
        padding: '8px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255,255,255,0.1)',
        fontSize: '14px',
        fontWeight: 'bold'
      }}>
        当前区块高度: {latestBlockNumber}
      </div>
      
      <Canvas camera={{ position: [0, 2, 12], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.6} color="#2B85E4" />
        <pointLight position={[-10, -10, -10]} intensity={0.4} />
        <spotLight
          position={[0, 8, 0]}
          angle={0.4}
          penumbra={1}
          intensity={0.6}
          castShadow
          color="#FFFFFF"
        />
        
        {/* 区块链渲染 */}
        <group position={[-blocks.length * 2.25 + 2.25, 0, 0]}>
          {blocks.map((block, index) => (
            <Block3D 
              key={block.id} 
              block={block} 
              index={index} 
              totalBlocks={blocks.length} 
            />
          ))}
        </group>
      </Canvas>
    </div>
  );
};

export default BlockchainDisplay3D;