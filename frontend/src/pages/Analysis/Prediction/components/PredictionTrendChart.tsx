// src/pages/Analysis/Prediction/components/PredictionTrendChart.tsx
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';  // 添加周数插件

// 注册 dayjs 插件
dayjs.extend(weekOfYear);

interface PredictionTrendChartProps {
  predictionType?: string;
  predictionPeriod?: string;
}

const PredictionTrendChart: React.FC<PredictionTrendChartProps> = ({ 
  predictionType = 'carbon',
  predictionPeriod = 'month'
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  
  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }
      
      // 获取预测类型的单位和标题
      const getUnitAndTitle = () => {
        switch (predictionType) {
          case 'carbon':
            return { unit: 'kg', title: '碳减排趋势预测' };
          case 'credits':
            return { unit: '', title: '碳积分趋势预测' };
          case 'mileage':
            return { unit: 'km', title: '行驶里程趋势预测' };
          default:
            return { unit: 'kg', title: '趋势预测' };
        }
      };
      
      const { unit, title } = getUnitAndTitle();
      
      // 调整基准值根据预测类型
      const getBaseValue = () => {
        switch (predictionType) {
          case 'carbon':
            return 900;
          case 'credits':
            return 45;
          case 'mileage':
            return 2700;
          default:
            return 900;
        }
      };
      
      // 生成模拟数据
      const generateData = () => {
        const dates = [];
        const historicalValues = [];
        const predictedValues = [];
        const confidenceInterval = [];
        
        const now = dayjs();
        const baseValue = getBaseValue();
        
        // 根据预测周期调整日期格式和数据点
        const getPeriodConfig = () => {
          switch (predictionPeriod) {
            case 'week':
              return { 
                historyCount: 8, 
                futureCount: 8, 
                format: (date: dayjs.Dayjs) => `${date.format('YYYY')}-W${date.week()}`,
                unit: 'week'
              };
            case 'month':
              return { 
                historyCount: 6, 
                futureCount: 6, 
                format: (date: dayjs.Dayjs) => `${date.format('YYYY')}-${date.format('MM')}`,
                unit: 'month'
              };
            case 'quarter':
              return { 
                historyCount: 4, 
                futureCount: 4, 
                format: (date: dayjs.Dayjs) => `${date.format('YYYY')}-Q${Math.floor(date.month() / 3) + 1}`,
                unit: 'quarter'
              };
            case 'year':
              return { 
                historyCount: 3, 
                futureCount: 5, 
                format: (date: dayjs.Dayjs) => `${date.format('YYYY')}`,
                unit: 'year'
              };
            default:
              return { 
                historyCount: 6, 
                futureCount: 6, 
                format: (date: dayjs.Dayjs) => `${date.format('YYYY')}-${date.format('MM')}`,
                unit: 'month'
              };
          }
        };
        
        const { historyCount, futureCount, format, unit } = getPeriodConfig();
        
        // 生成历史日期和数据
        for (let i = historyCount; i >= 1; i--) {
          const date = now.subtract(i, unit as any);
          dates.push(format(date));
          
          const randomFactor = 0.2; // 20%随机波动
          const seasonalFactor = 1 + 0.2 * Math.sin((date.month() / 12) * 2 * Math.PI); // 季节性因素
          
          const value = baseValue * seasonalFactor * (1 + (Math.random() * 2 - 1) * randomFactor);
          historicalValues.push(parseFloat(value.toFixed(1)));
          predictedValues.push(null);
          confidenceInterval.push([null, null]);
        }
        
        // 生成预测日期和数据
        const lastHistoricalValue = historicalValues[historicalValues.length - 1];
        const growthTrend = 1.02;  // 每期2%的增长趋势
        
        for (let i = 1; i <= futureCount; i++) {
          const date = now.add(i, unit as any);
          dates.push(format(date));
          
          const seasonalFactor = 1 + 0.2 * Math.sin((date.month() / 12) * 2 * Math.PI);
          const predictedValue = lastHistoricalValue * Math.pow(growthTrend, i) * seasonalFactor;
          
          historicalValues.push(null);
          predictedValues.push(parseFloat(predictedValue.toFixed(1)));
          
          // 计算置信区间
          const uncertainty = 0.1 * i;  // 不确定性随时间增加
          const lower = predictedValue * (1 - uncertainty);
          const upper = predictedValue * (1 + uncertainty);
          
          confidenceInterval.push([parseFloat(lower.toFixed(1)), parseFloat(upper.toFixed(1))]);
        }
        
        return { dates, historicalValues, predictedValues, confidenceInterval };
      };
      
      const { dates, historicalValues, predictedValues, confidenceInterval } = generateData();
      
      const option = {
        title: {
          text: title,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params: any) {
            const dataIndex = params[0].dataIndex;
            const date = dates[dataIndex];
            let result = `${date}<br>`;
            
            params.forEach((param: any) => {
              if (param.seriesName === '历史数据' && historicalValues[dataIndex] !== null) {
                result += `${param.seriesName}: ${historicalValues[dataIndex]} ${unit}<br>`;
              } else if (param.seriesName === '预测数据' && predictedValues[dataIndex] !== null) {
                result += `${param.seriesName}: ${predictedValues[dataIndex]} ${unit}<br>`;
                
                const [lower, upper] = confidenceInterval[dataIndex];
                if (lower !== null && upper !== null) {
                  result += `置信区间: [${lower}, ${upper}] ${unit}<br>`;
                }
              }
            });
            
            return result;
          }
        },
        legend: {
          data: ['历史数据', '预测数据', '置信区间'],
          top: 30
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: dates
        },
        yAxis: {
          type: 'value',
          name: predictionType === 'carbon' ? '碳减排量(kg)' : 
                predictionType === 'credits' ? '碳积分' : 
                '行驶里程(km)',
          min: 'dataMin',
          axisLabel: {
            formatter: `{value} ${unit}`
          }
        },
        series: [
          {
            name: '历史数据',
            type: 'line',
            data: historicalValues,
            symbolSize: 8,
            itemStyle: {
              color: '#5470c6'
            },
            lineStyle: {
              width: 3
            },
            connectNulls: false
          },
          {
            name: '预测数据',
            type: 'line',
            data: predictedValues,
            symbolSize: 8,
            itemStyle: {
              color: '#91cc75'
            },
            lineStyle: {
              width: 3,
              type: 'dashed'
            },
            connectNulls: false
          },
          {
            name: '置信区间',
            type: 'line',
            data: confidenceInterval.map(interval => interval[1]),  // 上界
            lineStyle: {
              opacity: 0
            },
            stack: 'confidence-interval',
            symbol: 'none'
          },
          {
            name: '置信区间',
            type: 'line',
            data: confidenceInterval.map(interval => {
              if (interval[0] === null || interval[1] === null) return null;
              return interval[0] - interval[1];  // 下界减上界
            }),
            lineStyle: {
              opacity: 0
            },
            areaStyle: {
              color: '#91cc75',
              opacity: 0.2
            },
            stack: 'confidence-interval',
            symbol: 'none'
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
  }, [predictionType, predictionPeriod]);
  
  return (
    <div ref={chartRef} style={{ height: '500px', width: '100%' }}></div>
  );
};

export default PredictionTrendChart;