// src/pages/Display/components/CarbonCreditsParticles.tsx
import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface CarbonCreditsParticlesProps {
  emitCount?: number; // 一次发射的粒子数量
  interval?: number;  // 发射间隔 (ms)
  className?: string;
  style?: React.CSSProperties;
}

const CarbonCreditsParticles: React.FC<CarbonCreditsParticlesProps> = ({
  emitCount = 5,
  interval = 2000,
  className = '',
  style = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 创建粒子DOM元素
  const createParticle = () => {
    if (!containerRef.current) return;
    
    for (let i = 0; i < emitCount; i++) {
      // 创建粒子元素
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // 随机粒子大小 (4px - 10px)
      const size = 4 + Math.random() * 6;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // 随机位置
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      const posX = Math.random() * containerWidth;
      const posY = containerHeight;
      
      // 设置初始样式
      particle.style.position = 'absolute';
      particle.style.left = `${posX}px`;
      particle.style.bottom = '0px';
      particle.style.borderRadius = '50%';
      particle.style.background = 'radial-gradient(circle at 30% 30%, #90EE90, #3CB371)';
      particle.style.boxShadow = '0 0 5px #3CB371';
      
      // 添加到容器
      containerRef.current.appendChild(particle);
      
      // 粒子动画
      gsap.to(particle, {
        y: -containerHeight - size,
        x: posX + (Math.random() * 100 - 50),
        opacity: 0,
        duration: 3 + Math.random() * 2,
        ease: "power1.out",
        onComplete: () => {
          // 动画完成后移除元素
          if (containerRef.current && containerRef.current.contains(particle)) {
            containerRef.current.removeChild(particle);
          }
        }
      });
    }
  };
  
  useEffect(() => {
    // 定期发射粒子
    const timer = setInterval(createParticle, interval);
    
    return () => {
      clearInterval(timer);
    };
  }, [interval, emitCount]);
  
  return (
    <div 
      ref={containerRef} 
      className={`carbon-particles-container ${className}`}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    />
  );
};

export default CarbonCreditsParticles;