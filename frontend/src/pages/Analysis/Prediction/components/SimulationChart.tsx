// src/pages/Analysis/Prediction/components/SimulationChart.tsx
import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { Radio, Space, Card, Row, Col, Slider, Typography } from 'antd';

const { Title, Text } = Typography;

interface SimulationChartProps {
  predictionType?: string;
}

const SimulationChart: React.FC<SimulationChartProps> = ({ 
  predictionType = 'carbon'
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  
  const [scenario, setScenario] = useState<string>('baseline');
  const [evPercentage, setEvPercentage] = useState<number>(30);
  const [gridEmissionFactor, setGridEmissionFactor] = useState<number>(85);
  
  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }
      
      // 获取预测类型的单位和标题
      const getUnitAndTitle = () => {
        switch (predictionType) {
          case 'carbon':
            return { unit: 'kg', title: '碳减排情景模拟' };
          case 'credits':
            return { unit: '', title: '碳积分情景模拟' };
          case 'mileage':
            return { unit: 'km', title: '行驶里程情景模拟' };
          default:
            return { unit: 'kg', title: '情景模拟' };
        }
      };
      
      const { unit, title } = getUnitAndTitle();
      
      // 生成模拟数据
      const generateSimulationData = () => {
        const years = ['2023', '2024', '2025', '2026', '2027', '2028'];
        
        // 根据预测类型设置基础数据
        let baselineData;
        let optimisticData;
        let conservativeData;
        
        switch (predictionType) {
          case 'carbon':
            baselineData = [1200, 1400, 1650, 1950, 2300, 2700];
            optimisticData = [1200, 1550, 1950, 2450, 3100, 3900];
            conservativeData = [1200, 1300, 1450, 1600, 1800, 2000];
            break;
          case 'credits':
            baselineData = [60, 70, 82, 97, 115, 135];
            optimisticData = [60, 77, 97, 122, 155, 195];
            conservativeData = [60, 65, 72, 80, 90, 100];
            break;
          case 'mileage':
            baselineData = [3600, 4200, 4950, 5850, 6900, 8100];
            optimisticData = [3600, 4650, 5850, 7350, 9300, 11700];
            conservativeData = [3600, 3900, 4350, 4800, 5400, 6000];
            break;
          default:
            baselineData = [1200, 1400, 1650, 1950, 2300, 2700];
            optimisticData = [1200, 1550, 1950, 2450, 3100, 3900];
            conservativeData = [1200, 1300, 1450, 1600, 1800, 2000];
        }
        
        // 根据EV渗透率调整
        const evFactorMultiplier = evPercentage / 30; // 基准是30%
        
        // 根据电网排放因子调整 (只影响碳减排和碳积分)
        const gridFactorMultiplier = predictionType === 'mileage' ? 1 : 
                                    1 - ((gridEmissionFactor - 85) / 85 * 0.2); // 基准是85，影响±20%
        
        // 应用调整因子
        baselineData = baselineData.map(val => Math.round(val * evFactorMultiplier * gridFactorMultiplier));
        optimisticData = optimisticData.map(val => Math.round(val * evFactorMultiplier * gridFactorMultiplier * 1.1));
        conservativeData = conservativeData.map(val => Math.round(val * evFactorMultiplier * gridFactorMultiplier * 0.9));
        
        // 根据选择的场景返回相应数据
        if (scenario === 'optimistic') {
          return { years, data: optimisticData };
        } else if (scenario === 'conservative') {
          return { years, data: conservativeData };
        } else {
          return { years, data: baselineData };
        }
      };
      
      const { years, data } = generateSimulationData();
      
      // 设置颜色
      let seriesColor = '#5470c6'; // 基准情景颜色
      if (scenario === 'optimistic') {
        seriesColor = '#91cc75'; // 乐观情景颜色
      } else if (scenario === 'conservative') {
        seriesColor = '#ee6666'; // 保守情景颜色
      }
      
      const option = {
        title: {
          text: title,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params: any) {
            const dataIndex = params[0].dataIndex;
            const year = years[dataIndex];
            const value = data[dataIndex];
            return `${year}年<br>${params[0].seriesName}: ${value} ${unit}`;
          }
        },
        xAxis: {
          type: 'category',
          data: years,
          name: '年份'
        },
        yAxis: {
          type: 'value',
          name: predictionType === 'carbon' ? '年度碳减排量(kg)' : 
                predictionType === 'credits' ? '年度碳积分' : 
                '年度行驶里程(km)',
          axisLabel: {
            formatter: `{value} ${unit}`
          }
        },
        series: [
          {
            name: scenario === 'baseline' ? '基准情景' : 
                  scenario === 'optimistic' ? '乐观情景' : '保守情景',
            type: 'bar',
            data: data,
            itemStyle: {
              color: seriesColor
            },
            label: {
              show: true,
              position: 'top',
              formatter: `{c} ${unit}`
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
  }, [scenario, evPercentage, gridEmissionFactor, predictionType]);
  
  // 获取情景描述
  const getScenarioDescriptions = () => {
    if (predictionType === 'carbon') {
      return {
        baseline: '假设电动车保持正常增长速度，电网清洁化进程稳定推进。这种情景下，碳减排量将呈现平稳上升趋势。',
        optimistic: '假设电动车采用率大幅提升，同时电网清洁化速度加快。这种情景下，碳减排量将呈现加速增长趋势。',
        conservative: '假设电动车增长受阻，电网清洁化进程放缓。这种情景下，碳减排量将呈现缓慢增长趋势。'
      };
    } else if (predictionType === 'credits') {
      return {
        baseline: '假设碳积分转换比例保持稳定，碳减排量正常增长。这种情景下，碳积分将呈现平稳上升趋势。',
        optimistic: '假设碳积分转换比例提高，碳减排量加速增长。这种情景下，碳积分将呈现显著增长趋势。',
        conservative: '假设碳积分转换比例降低，碳减排量增长缓慢。这种情景下，碳积分将呈现轻微增长趋势。'
      };
    } else {
      return {
        baseline: '假设营运车辆保持正常运营频率，平均行驶距离稳定。这种情景下，行驶里程将呈现平稳上升趋势。',
        optimistic: '假设运营需求增加，平均行驶距离提升。这种情景下，行驶里程将呈现显著增长趋势。',
        conservative: '假设受外部因素影响，运营频率下降。这种情景下，行驶里程将呈现缓慢增长趋势。'
      };
    }
  };
  
  const scenarioDescriptions = getScenarioDescriptions();
  
  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="情景设置" size="small">
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>情景选择</Text>
                  <Radio.Group 
                    value={scenario} 
                    onChange={e => setScenario(e.target.value)}
                    style={{ marginLeft: 16 }}
                  >
                    <Space direction="vertical">
                      <Radio value="baseline">基准情景 (正常增长)</Radio>
                      <Radio value="optimistic">乐观情景 (加速增长)</Radio>
                      <Radio value="conservative">保守情景 (缓慢增长)</Radio>
                    </Space>
                  </Radio.Group>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>电动车渗透率 ({evPercentage}%)</Text>
                  <Slider
                    min={10}
                    max={50}
                    value={evPercentage}
                    onChange={value => setEvPercentage(value)}
                    marks={{
                      10: '10%',
                      30: '30%',
                      50: '50%'
                    }}
                  />
                </div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>电网排放因子 ({gridEmissionFactor} g/kWh)</Text>
                  <Slider
                    min={60}
                    max={110}
                    value={gridEmissionFactor}
                    onChange={value => setGridEmissionFactor(value)}
                    marks={{
                      60: '60',
                      85: '85',
                      110: '110'
                    }}
                    disabled={predictionType === 'mileage'} // 行驶里程预测不受电网排放因子影响
                  />
                  </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      
      <div ref={chartRef} style={{ height: '400px', width: '100%', marginTop: 16 }}></div>
      
      <Card style={{ marginTop: 16 }}>
        <Title level={5}>情景说明</Title>
        <Row gutter={16}>
          <Col span={8}>
            <Text strong>基准情景：</Text>
            <p>{scenarioDescriptions.baseline}</p>
          </Col>
          <Col span={8}>
            <Text strong>乐观情景：</Text>
            <p>{scenarioDescriptions.optimistic}</p>
          </Col>
          <Col span={8}>
            <Text strong>保守情景：</Text>
            <p>{scenarioDescriptions.conservative}</p>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SimulationChart;