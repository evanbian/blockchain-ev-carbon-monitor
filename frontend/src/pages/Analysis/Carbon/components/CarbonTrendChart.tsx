// src/pages/Analysis/Carbon/components/CarbonTrendChart.tsx
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface CarbonTrendChartProps {
  chartType: string;
  groupBy: string;
}

const CarbonTrendChart: React.FC<CarbonTrendChartProps> = ({ chartType, groupBy }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  
  // 模拟数据
  const generateMockData = () => {
    let dates: string[] = [];
    let carbonData: number[] = [];
    let creditsData: number[] = [];
    
    const now = new Date();
    const daysCount = groupBy === 'day' ? 30 : groupBy === 'week' ? 12 : 6;
    
    for (let i = 0; i < daysCount; i++) {
      const date = new Date(now);
      
      if (groupBy === 'day') {
        date.setDate(now.getDate() - (daysCount - i - 1));
        dates.push(`${date.getMonth() + 1}月${date.getDate()}日`);
      } else if (groupBy === 'week') {
        date.setDate(now.getDate() - (daysCount - i - 1) * 7);
        dates.push(`第${i+1}周`);
      } else {
        date.setMonth(now.getMonth() - (daysCount - i - 1));
        dates.push(`${date.getMonth() + 1}月`);
      }
      
      // 随机生成数据
      const base = groupBy === 'day' ? 30 : groupBy === 'week' ? 210 : 900;
      const randomFactor = 0.2; // 20%的随机波动
      
      const randomValue = base * (1 + (Math.random() * 2 - 1) * randomFactor);
      carbonData.push(parseFloat(randomValue.toFixed(1)));
      creditsData.push(parseFloat((randomValue * 0.05).toFixed(1)));
    }
    
    return { dates, carbonData, creditsData };
  };
  
  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }
      
      const { dates, carbonData, creditsData } = generateMockData();
      
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
          data: dates
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
            data: carbonData,
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
            data: creditsData,
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
  }, [chartType, groupBy]);
  
  return (
    <div ref={chartRef} style={{ height: '400px', width: '100%' }}></div>
  );
};

export default CarbonTrendChart;