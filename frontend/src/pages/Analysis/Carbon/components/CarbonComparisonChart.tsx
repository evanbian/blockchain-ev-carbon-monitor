// src/pages/Analysis/Carbon/components/CarbonComparisonChart.tsx
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { CarbonSummary } from '@/services/analytics';
import { Alert } from 'antd';

interface CarbonComparisonChartProps {
  data: CarbonSummary | null;
}

const CarbonComparisonChart: React.FC<CarbonComparisonChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }
    
    try {
      if (!data) {
        throw new Error('暂无数据');
      }
      
      // 计算传统燃油车排放（使用 comparedToFuel）
      // Note: Ensure the logic KG_CO2_PER_LITER_FUEL (2.3) matches backend constant if changed
      const traditionalEmission = data.comparedToFuel * 2.3;
      
      // 计算电网排放（保持原有逻辑，但建议确认其准确性）
      // Note: Factor 0.85 kgCO2/kWh is an assumption here
      const gridEmission = (data.totalReduction / 0.85) * 0.85;
      
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
              {value: traditionalEmission, name: '传统燃油车排放', itemStyle: {color: '#ff7d7d'}},
              {value: gridEmission, name: '电网排放', itemStyle: {color: '#ffb782'}},
              {value: data.totalReduction, name: '减排量', itemStyle: {color: '#91cc75'}}
            ]
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
  }, [data]);
  
  if (!data) {
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
    <div ref={chartRef} style={{ height: '300px', width: '100%' }}></div>
  );
};

export default CarbonComparisonChart;