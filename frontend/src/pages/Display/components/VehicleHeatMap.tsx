// src/pages/Display/components/VehicleHeatMap.tsx
import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
// 需要单独引入ECharts地图扩展
import 'echarts/extension/bmap/bmap';

interface VehicleHeatMapProps {
  style?: React.CSSProperties;
  className?: string;
}

const VehicleHeatMap: React.FC<VehicleHeatMapProps> = ({ style, className }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  
  // 生成雄安新区区域的模拟车辆数据
  const generateVehicleData = () => {
    // 雄安新区大致坐标范围
    const centerLat = 39.0356;
    const centerLng = 116.0662;
    
    const points = [];
    
    // 生成40个随机点
    for (let i = 0; i < 40; i++) {
      // 随机偏移，但保持在雄安新区范围内
      const latOffset = (Math.random() - 0.5) * 0.1;
      const lngOffset = (Math.random() - 0.5) * 0.1;
      
      points.push([
        centerLng + lngOffset,
        centerLat + latOffset,
        Math.floor(Math.random() * 100) // 随机热力值
      ]);
    }
    
    return points;
  };
  
  // 初始化图表
  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }
      
      // 创建简化版本的地图热力图
      // 实际项目中应该加载真实的地图数据
      const option = {
        title: {
          text: '雄安新区车辆分布',
          left: 'center',
          textStyle: {
            color: '#333'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => {
            return `位置: (${params.value[0].toFixed(4)}, ${params.value[1].toFixed(4)})<br/>活跃度: ${params.value[2]}`;
          }
        },
        visualMap: {
          min: 0,
          max: 100,
          calculable: true,
          inRange: {
            color: ['blue', 'green', 'yellow', 'red']
          },
          textStyle: {
            color: '#333'
          },
          left: 'left',
          top: 'bottom'
        },
        geo: {
          map: 'china',
          roam: true,
          center: [116.0662, 39.0356], // 雄安新区中心
          zoom: 10,
          label: {
            emphasis: {
              show: false
            }
          },
          itemStyle: {
            normal: {
              areaColor: '#f3f3f3',
              borderColor: '#ddd'
            },
            emphasis: {
              areaColor: '#e6f7ff'
            }
          }
        },
        series: [
          {
            name: '车辆分布',
            type: 'scatter',
            coordinateSystem: 'geo',
            data: generateVehicleData(),
            symbolSize: (val: any) => val[2] / 10 + 5,
            label: {
              normal: {
                show: false
              },
              emphasis: {
                show: false
              }
            },
            itemStyle: {
              normal: {
                color: (params: any) => {
                  const value = params.data[2];
                  if (value > 75) return '#ff4d4f';
                  if (value > 50) return '#ffa940';
                  if (value > 25) return '#52c41a';
                  return '#1890ff';
                },
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.3)'
              },
              emphasis: {
                borderColor: '#fff',
                borderWidth: 1
              }
            }
          }
        ]
      };
      
      // 为简化起见，我们使用散点图代替真实地图
      // 在实际项目中，您应该加载真实的雄安新区地图数据
      const simpleOption = {
        title: {
          text: '雄安新区车辆分布图',
          left: 'center',
          top: 10,
        },
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => {
            return `车辆ID: ${params.value[3]}<br/>位置: (${params.value[0].toFixed(4)}, ${params.value[1].toFixed(4)})<br/>状态: ${params.value[2] > 75 ? '行驶中' : params.value[2] > 50 ? '怠速' : params.value[2] > 25 ? '充电中' : '停车'}<br/>电量: ${Math.floor(params.value[2])}%`;
          }
        },
        grid: {
          left: '5%',
          right: '5%',
          top: '15%',
          bottom: '15%'
        },
        xAxis: {
          name: '经度',
          nameLocation: 'center',
          nameGap: 30,
          type: 'value',
          min: 115.98,
          max: 116.15,
          splitLine: {
            show: true,
            lineStyle: {
              color: '#eee',
              type: 'dashed'
            }
          },
          axisLine: {
            show: true
          }
        },
        yAxis: {
          name: '纬度',
          nameLocation: 'center',
          nameGap: 30,
          type: 'value',
          min: 38.98,
          max: 39.15,
          splitLine: {
            show: true,
            lineStyle: {
              color: '#eee',
              type: 'dashed'
            }
          },
          axisLine: {
            show: true
          }
        },
        visualMap: {
          min: 0,
          max: 100,
          calculable: true,
          inRange: {
            color: ['#1890ff', '#52c41a', '#faad14', '#ff4d4f']
          },
          orient: 'horizontal',
          left: 'center',
          bottom: '5%',
          textStyle: {
            color: '#333'
          }
        },
        series: [{
          type: 'scatter',
          symbolSize: (val: any) => val[2] / 5 + 8,
          data: generateVehicleData().map((item, index) => [
            item[0], 
            item[1], 
            item[2],
            `EV-${1000 + index}` // 添加车辆ID
          ]),
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowOffsetY: 5
          },
          animation: true,
          animationDuration: 1000,
          animationEasing: 'cubicOut'
        }]
      };
      
      // 设置图表选项
      chartInstance.current.setOption(simpleOption);
      
      // 每5秒更新数据，模拟车辆移动
      const interval = setInterval(() => {
        if (chartInstance.current) {
          chartInstance.current.setOption({
            series: [{
              data: generateVehicleData().map((item, index) => [
                item[0], 
                item[1], 
                item[2],
                `EV-${1000 + index}`
              ])
            }]
          });
        }
      }, 5000);
      
      // 窗口大小变化时调整图表尺寸
      const handleResize = () => {
        if (chartInstance.current) {
          chartInstance.current.resize();
        }
      };
      window.addEventListener('resize', handleResize);
      
      // 清理函数
      return () => {
        clearInterval(interval);
        window.removeEventListener('resize', handleResize);
        if (chartInstance.current) {
          chartInstance.current.dispose();
          chartInstance.current = null;
        }
      };
    }
  }, []);
  
  return (
    <div 
      ref={chartRef} 
      className={`vehicle-heatmap ${className || ''}`} 
      style={{ width: '100%', height: '100%', ...style }}
    />
  );
};

export default VehicleHeatMap;