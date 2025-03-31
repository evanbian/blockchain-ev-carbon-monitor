// src/pages/Analysis/Vehicle/components/DrivingPatternChart.tsx
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const DrivingPatternChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  
  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }
      
      const hours = [
        '0:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00',
        '7:00', '8:00', '9:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
        '19:00', '20:00', '21:00', '22:00', '23:00'
      ];
      
      // 模拟数据 - 每小时行驶数据分布
      const data = [
        0, 0, 0, 0, 0, 1, 5,
        15, 25, 8, 3, 6, 12,
        10, 4, 7, 8, 22, 20,
        12, 5, 3, 1, 0
      ];
      
      // 根据数据值确定颜色
      const getItemColor = (value: number) => {
        if (value > 20) return '#EE6666';
        if (value > 10) return '#FAC858';
        if (value > 5) return '#91CC75';
        return '#5470C6';
      };
      
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: function(params: any) {
            const dataIndex = params[0].dataIndex;
            const hour = hours[dataIndex];
            const value = data[dataIndex];
            return `${hour}: ${value}% 的行驶时间`;
          }
        },
        xAxis: {
          type: 'category',
          data: hours,
          axisLabel: {
            interval: 2
          }
        },
        yAxis: {
          type: 'value',
          name: '行驶时间占比(%)',
          max: 30
        },
        series: [{
          data: data.map(value => ({
            value: value,
            itemStyle: {
              color: getItemColor(value)
            }
          })),
          type: 'bar',
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(180, 180, 180, 0.2)'
          }
        }],
        visualMap: {
          show: false,
          min: 0,
          max: 30,
          inRange: {
            colorLightness: [0.4, 0.8]
          }
        }
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

export default DrivingPatternChart;