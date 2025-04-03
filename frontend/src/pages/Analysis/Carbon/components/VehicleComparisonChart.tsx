// src/pages/Analysis/Carbon/components/VehicleComparisonChart.tsx
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { CarbonModelData } from '@/services/analytics';
import { Alert } from 'antd';

interface VehicleComparisonChartProps {
  data: CarbonModelData[];
}

const VehicleComparisonChart: React.FC<VehicleComparisonChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }
    
    try {
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('暂无数据');
      }
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['总减排量'],
          top: 10,
          right: 10
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: data.map(item => item.model),
          axisLabel: {
            interval: 0,
            rotate: 30
          }
        },
        yAxis: {
          type: 'value',
          name: '碳减排量(kg)',
          axisLabel: {
            formatter: '{value} kg'
          }
        },
        series: [
          {
            name: '总减排量',
            type: 'bar',
            data: data.map(item => item.reduction),
            itemStyle: {
              color: '#5470c6'
            }
          },
        ]
      };
      
      chartInstance.current.setOption(option);
    } catch (error) {
      console.error('Error rendering chart:', error);
      if (chartInstance.current) {
        chartInstance.current.clear();
      }
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
  }, [data]);
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Alert
        message="暂无数据"
        description="所选时间范围内没有车型对比数据"
        type="info"
        showIcon
        style={{ margin: '20px 0' }}
      />
    );
  }
  
  return (
    <div ref={chartRef} style={{ height: '300px', width: '100%' }}></div>
  );
};

export default VehicleComparisonChart;