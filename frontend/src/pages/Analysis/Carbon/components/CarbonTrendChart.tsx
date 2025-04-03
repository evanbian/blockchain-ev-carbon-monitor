// src/pages/Analysis/Carbon/components/CarbonTrendChart.tsx
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { CarbonTrend } from '@/services/analytics';
import { Alert } from 'antd';

interface CarbonTrendChartProps {
  chartType: string;
  groupBy: string;
  data: CarbonTrend[];
}

const CarbonTrendChart: React.FC<CarbonTrendChartProps> = ({ chartType, groupBy, data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  
  useEffect(() => {
    if (!chartRef.current) return () => {};
    
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }
    
    try {
      if (!data || data.length === 0) {
        throw new Error('暂无数据');
      }
      
      if (!Array.isArray(data)) {
        console.error("Expected data to be an array, but got:", data);
        return () => {};
      }
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          data: ['碳减排量(kg)', '碳积分'],
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
          boundaryGap: chartType === 'bar',
          data: data.map(item => item.date)
        },
        yAxis: [
          {
            type: 'value',
            name: '碳减排量(kg)',
            position: 'left',
            axisLine: {
              show: true,
              lineStyle: {
                color: '#5470c6'
              }
            },
            axisLabel: {
              formatter: '{value} kg'
            }
          },
          {
            type: 'value',
            name: '碳积分',
            position: 'right',
            axisLine: {
              show: true,
              lineStyle: {
                color: '#91cc75'
              }
            },
            axisLabel: {
              formatter: '{value}'
            }
          }
        ],
        series: [
          {
            name: '碳减排量(kg)',
            type: chartType === 'line' ? 'line' : 'bar',
            yAxisIndex: 0,
            data: data.map(item => item.reduction),
            smooth: true,
            lineStyle: {
              width: 3
            },
            areaStyle: chartType === 'line' ? {
              opacity: 0.3
            } : undefined,
            itemStyle: {
              color: '#5470c6'
            }
          },
          {
            name: '碳积分',
            type: 'line',
            yAxisIndex: 1,
            data: data.map(item => item.credits),
            smooth: true,
            lineStyle: {
              width: 2
            },
            itemStyle: {
              color: '#91cc75'
            }
          }
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
  }, [chartType, groupBy, data]);
  
  if (!data || data.length === 0) {
    return (
      <Alert
        message="暂无数据"
        description="所选时间范围内没有碳减排数据"
        type="info"
        showIcon
        style={{ margin: '20px 0' }}
      />
    );
  }
  
  return (
    <div ref={chartRef} style={{ height: '400px', width: '100%' }}></div>
  );
};

export default CarbonTrendChart;