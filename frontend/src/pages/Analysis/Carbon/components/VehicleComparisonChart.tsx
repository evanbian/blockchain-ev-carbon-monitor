// src/pages/Analysis/Carbon/components/VehicleComparisonChart.tsx
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const VehicleComparisonChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  
  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params: any) {
            const vehicleName = params[0].name;
            const totalReduction = params[0].value;
            const averageReduction = params[1].value;
            return `${vehicleName}<br/>总减排量: ${totalReduction} kg<br/>单位减排量: ${averageReduction} kg/km`;
          }
        },
        legend: {
          data: ['总减排量', '单位减排量'],
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
          data: ['比亚迪汉EV', '特斯拉Model 3', '蔚来ES6']
        },
        yAxis: [
          {
            type: 'value',
            name: '总减排量(kg)',
            min: 0,
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
            name: '单位减排量(kg/km)',
            min: 0,
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
            name: '总减排量',
            type: 'bar',
            yAxisIndex: 0,
            data: [3750.5, 2940.2, 4560.8],
            itemStyle: {
              color: '#5470c6'
            }
          },
          {
            name: '单位减排量',
            type: 'line',
            yAxisIndex: 1,
            data: [0.30, 0.29, 0.31],
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: '#91cc75'
            },
            lineStyle: {
              width: 3
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
  }, []);
  
  return (
    <div ref={chartRef} style={{ height: '300px', width: '100%' }}></div>
  );
};

export default VehicleComparisonChart;