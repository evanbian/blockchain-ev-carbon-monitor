// src/pages/Analysis/Vehicle/components/MileageChart.tsx
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const MileageChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  
  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }
      
      // 生成模拟数据 - 30天里程趋势
      const generateData = () => {
        const dates = [];
        const values = [];
        const now = new Date();
        const baseValue = 50;
        
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          
          const dateStr = `${date.getMonth() + 1}-${date.getDate()}`;
          dates.push(dateStr);
          
          // 生成随机数据，考虑周末数据更多
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const randomMultiplier = isWeekend ? 1.5 : 1;
          const value = baseValue * (0.7 + Math.random() * 0.6) * randomMultiplier;
          
          // 周日可能更低
          if (date.getDay() === 0) {
            values.push(value * 0.7);
          } else {
            values.push(value);
          }
        }
        
        return { dates, values };
      };
      
      const { dates, values } = generateData();
      
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: function(params: any) {
            const dataIndex = params[0].dataIndex;
            const date = dates[dataIndex];
            const value = values[dataIndex].toFixed(1);
            return `${date}: ${value} km`;
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: dates,
          axisLabel: {
            interval: 5
          }
        },
        yAxis: {
          type: 'value',
          name: '日行驶里程(km)',
          min: 0
        },
        series: [{
          data: values,
          type: 'line',
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0,
                color: 'rgba(58, 71, 212, 0.5)'
              }, {
                offset: 1,
                color: 'rgba(58, 71, 212, 0.1)'
              }]
            }
          },
          lineStyle: {
            width: 3,
            color: '#3a47d4'
          },
          markPoint: {
            data: [
              { type: 'max', name: '最大值' },
              { type: 'min', name: '最小值' }
            ]
          },
          markLine: {
            data: [
              { type: 'average', name: '平均值' }
            ]
          },
          smooth: true
        }]
      };
      
      chartInstance.current.setOption(option);
    }
    
    // 监听窗口大小变化，调整图表大小
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div ref={chartRef} style={{ height: '300px', width: '100%' }}></div>
  );
};

export default MileageChart;