// src/pages/Display/components/AnimatedCounter.tsx
import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  precision?: number;
  className?: string;
  style?: React.CSSProperties;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2,
  precision = 1,
  className = '',
  style = {},
  prefix,
  suffix
}) => {
  const counterRef = useRef<HTMLSpanElement>(null);
  const prevValueRef = useRef<number>(0);
  
  useEffect(() => {
    if (counterRef.current) {
      // 创建动画
      gsap.to(
        { val: prevValueRef.current },
        {
          val: value,
          duration: duration,
          ease: "power2.out",
          onUpdate: function() {
            if (counterRef.current) {
              counterRef.current.textContent = this.targets()[0].val.toFixed(precision);
            }
          }
        }
      );
      
      // 更新之前的值
      prevValueRef.current = value;
    }
  }, [value, duration, precision]);
  
  return (
    <div className={`animated-counter ${className}`} style={style}>
      {prefix}
      <span ref={counterRef}>{value.toFixed(precision)}</span>
      {suffix}
    </div>
  );
};

export default AnimatedCounter;