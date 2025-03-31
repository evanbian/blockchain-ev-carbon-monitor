// src/pages/Analysis/Carbon/components/CarbonComparisonChart.tsx
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const CarbonComparisonChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  
  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} kg ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['传统燃油车排放', '电网排放', '减排量']
        },
        series: [
          {
            name: '碳排放对比',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '16',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              {value: 18876.3, name: '传统燃油车排放', itemStyle: {color: '#ff7d7d'}},
              {value: 6292.1, name: '电网排放', itemStyle: {color: '#ffb782'}},
              {value: 12584.2, name: '减排量', itemStyle: {color: '#91cc75'}}
            ]
          }
        ]
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

export default CarbonComparisonChart;