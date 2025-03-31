// src/pages/Analysis/Vehicle/components/EnergyUsageChart.tsx
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const EnergyUsageChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  
  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }
      
      // 生成模拟数据
      const days = ['6-25', '6-26', '6-27', '6-28', '6-29', '6-30', '7-1'];
      const mileageData = [58.5, 42.3, 65.1, 38.7, 72.4, 43.9, 52.3];
      const energyData = [9.6, 6.5, 9.2, 4.5, 10.8, 7.2, 6.8];
      const efficiencyData = mileageData.map((mileage, index) => 
        parseFloat(((energyData[index] / mileage) * 100).toFixed(1))
      );
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          }
        },
        toolbox: {
          feature: {
            dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ['line', 'bar'] },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        legend: {
          data: ['行驶里程', '能耗', '单位能耗']
        },
        xAxis: [
          {
            type: 'category',
            data: days,
            axisPointer: {
              type: 'shadow'
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '里程/能耗',
            min: 0,
            max: 100,
            interval: 20,
            axisLabel: {
              formatter: '{value}'
            }
          },
          {
            type: 'value',
            name: '单位能耗(kWh/100km)',
            min: 0,
            max: 20,
            interval: 5,
            axisLabel: {
              formatter: '{value}'
            }
          }
        ],
        series: [
          {
            name: '行驶里程',
            type: 'bar',
            tooltip: {
              valueFormatter: function (value: number) {
                return value + ' km';
              }
            },
            data: mileageData,
            itemStyle: {
              color: '#5470c6'
            }
          },
          {
            name: '能耗',
            type: 'bar',
            tooltip: {
              valueFormatter: function (value: number) {
                return value + ' kWh';
              }
            },
            data: energyData,
            itemStyle: {
              color: '#91cc75'
            }
          },
          {
            name: '单位能耗',
            type: 'line',
            yAxisIndex: 1,
            tooltip: {
              valueFormatter: function (value: number) {
                return value + ' kWh/100km';
              }
            },
            data: efficiencyData,
            itemStyle: {
              color: '#ee6666'
            },
            lineStyle: {
              width: 3
            },
            smooth: true
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
    <div ref={chartRef} style={{ height: '400px', width: '100%' }}></div>
  );
};

export default EnergyUsageChart;