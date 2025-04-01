// src/pages/Display/components/VehicleMapDisplay.tsx
import React, { useEffect, useRef, useState } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';

interface VehicleMapDisplayProps {
  style?: React.CSSProperties;
  className?: string;
}

const VehicleMapDisplay: React.FC<VehicleMapDisplayProps> = ({
  style,
  className
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [heatmapLayer, setHeatmapLayer] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  
  // 获取模拟车辆数据点
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
      
      points.push({
        lng: centerLng + lngOffset,
        lat: centerLat + latOffset,
        count: Math.floor(Math.random() * 100) // 随机热力值
      });
    }
    
    return points;
  };

  // 确保组件已挂载
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  // 初始化地图
  useEffect(() => {
    // 确保组件已挂载且mapRef指向的DOM元素存在
    if (mounted && mapRef.current && !mapInstance) {
      // 延迟一帧再初始化地图，确保DOM已完全加载
      setTimeout(() => {
        try {
          // 使用环境变量中的API密钥或使用临时密钥（仅用于开发）
          const apiKey = '4f73ae034a7bfcad2af62831f9d3685b';
          
          AMapLoader.load({
            key: apiKey,
            version: '2.0',
            plugins: ['AMap.HeatMap']
          })
          .then((AMap) => {
            // 确保mapRef.current仍然存在
            if (!mapRef.current) return;
            
            const map = new AMap.Map(mapRef.current, {
              viewMode: '3D',
              zoom: 13,
              center: [116.0662, 39.0356], // 雄安新区中心
              mapStyle: 'amap://styles/dark'
            });
            
            setMapInstance(map);
            
            // 创建热力图层
            const heatmap = new AMap.HeatMap(map, {
              radius: 25,
              opacity: [0, 0.8],
              gradient: {
                0.4: 'rgb(0, 255, 255)',
                0.65: 'rgb(0, 255, 0)',
                0.85: 'rgb(255, 255, 0)',
                1.0: 'rgb(255, 0, 0)'
              }
            });
            
            setHeatmapLayer(heatmap);
            
            // 设置初始数据
            const points = generateVehicleData();
            heatmap.setDataSet({
              data: points,
              max: 100
            });
          })
          .catch(e => {
            console.error('地图加载失败:', e);
          });
        } catch (err) {
          console.error('初始化地图时出错:', err);
        }
      }, 100);
    }
    
    return () => {
      if (mapInstance) {
        mapInstance.destroy();
      }
    };
  }, [mounted, mapInstance]);
  
  // 定期更新热力图数据
  useEffect(() => {
    if (!heatmapLayer) return;
    
    const updateInterval = setInterval(() => {
      const points = generateVehicleData();
      heatmapLayer.setDataSet({
        data: points,
        max: 100
      });
    }, 5000);
    
    return () => clearInterval(updateInterval);
  }, [heatmapLayer]);

  return (
    <div 
      ref={mapRef}
      className={`vehicle-map-display ${className || ''}`}
      style={{ 
        width: '100%', 
        height: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        ...style 
      }}
    >
      {!mapInstance && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          background: '#f0f2f5'
        }}>
          正在加载地图...
        </div>
      )}
    </div>
  );
};

export default VehicleMapDisplay;