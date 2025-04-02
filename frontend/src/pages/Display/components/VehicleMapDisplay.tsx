// src/pages/Display/components/VehicleMapDisplay.tsx
import React, { useEffect, useRef, useState } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';

// 为window添加AMap类型
declare global {
  interface Window {
    AMap: any;
  }
}

interface VehicleMapDisplayProps {
  style?: React.CSSProperties;
  className?: string;
}

interface VehicleData {
  id: string;
  position: [number, number]; // [lng, lat]
  speed: number;
  direction: number;
  licensePlate: string;
  model: string;
  status: string;
  batteryLevel: number;
  mileage: number;
  carbonReduction: number;
}

// 轨迹线数据结构，与车辆数据分离
interface TrackData {
  vehicleId: string;
  path: [number, number][];
  status: string;
}

const VehicleMapDisplay: React.FC<VehicleMapDisplayProps> = ({
  style,
  className
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [heatmapLayer, setHeatmapLayer] = useState<any>(null);
  const [vehicleMarkers, setVehicleMarkers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [tracks, setTracks] = useState<TrackData[]>([]); // 轨迹数据单独保存
  const [pathLines, setPathLines] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // 雄安新区大致坐标范围
  const CENTER_LAT = 39.0356;
  const CENTER_LNG = 116.0662;
  
  // 生成初始车辆数据
  const generateInitialVehicles = () => {
    const models = ['比亚迪汉EV', '特斯拉Model 3', '蔚来ES6', '小鹏P7', '理想ONE'];
    const statuses = ['行驶中', '充电中', '停车'];
    
    const initialVehicles = Array.from({ length: 15 }, (_, i) => {
      // 随机偏移，但保持在雄安新区范围内
      const latOffset = (Math.random() - 0.5) * 0.05;
      const lngOffset = (Math.random() - 0.5) * 0.05;
      
      return {
        id: `vehicle-${i}`,
        position: [CENTER_LNG + lngOffset, CENTER_LAT + latOffset],
        speed: Math.floor(Math.random() * 80),
        direction: Math.floor(Math.random() * 360),
        licensePlate: `京${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${1000 + Math.floor(Math.random() * 9000)}`,
        model: models[Math.floor(Math.random() * models.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        batteryLevel: 20 + Math.floor(Math.random() * 80),
        mileage: 1000 + Math.floor(Math.random() * 5000),
        carbonReduction: 100 + Math.floor(Math.random() * 900)
      };
    });
    
    // 初始化轨迹数据
    const initialTracks = initialVehicles.map(vehicle => ({
      vehicleId: vehicle.id,
      path: [] as [number, number][],
      status: vehicle.status
    }));
    
    setVehicles(initialVehicles);
    setTracks(initialTracks);
  };
  
  // 获取模拟车辆数据点
  const generateHeatmapData = (vehicleList: VehicleData[]) => {
    // 防止无效坐标
    return vehicleList
      .filter(vehicle => 
        !isNaN(vehicle.position[0]) && 
        !isNaN(vehicle.position[1]) &&
        vehicle.position[0] !== 0 &&
        vehicle.position[1] !== 0
      )
      .map(vehicle => ({
        lng: vehicle.position[0],
        lat: vehicle.position[1],
        count: vehicle.status === '行驶中' ? 80 : vehicle.status === '充电中' ? 60 : 40
      }));
  };
  
  // 更新车辆位置
  const updateVehiclePositions = () => {
    // 先更新车辆位置
    setVehicles(prev => {
      return prev.map(vehicle => {
        // 只更新行驶中的车辆位置
        if (vehicle.status !== '行驶中') return vehicle;
        
        // 计算新位置 (模拟移动)
        const moveDistance = vehicle.speed / 3600; // 转换为每秒移动的度数
        const radian = vehicle.direction * Math.PI / 180;
        const lng = vehicle.position[0] + moveDistance * Math.sin(radian) * 0.05;
        const lat = vehicle.position[1] + moveDistance * Math.cos(radian) * 0.05;
        
        // 确保车辆不会跑出边界
        const maxOffset = 0.05;
        if (Math.abs(lng - CENTER_LNG) > maxOffset || Math.abs(lat - CENTER_LAT) > maxOffset) {
          // 调整方向往回走
          return {
            ...vehicle,
            direction: (vehicle.direction + 180) % 360,
            speed: 20 + Math.floor(Math.random() * 60)
          };
        }
        
        // 随机调整方向和速度
        const newDirection = vehicle.direction + (Math.random() - 0.5) * 20;
        const newSpeed = Math.max(20, Math.min(80, vehicle.speed + (Math.random() - 0.5) * 5));
        
        return {
          ...vehicle,
          position: [lng, lat],
          direction: newDirection,
          speed: newSpeed
        };
      });
    });
    
    // 然后分开更新轨迹
    setTracks(prevTracks => {
      return prevTracks.map(track => {
        // 找到对应车辆
        const vehicle = vehicles.find(v => v.id === track.vehicleId);
        if (!vehicle) return track;
        
        // 更新状态
        const updatedTrack = { 
          ...track, 
          status: vehicle.status 
        };
        
        // 只为行驶中的车辆添加轨迹点
        if (vehicle.status === '行驶中') {
          // 只有在轨迹为空或者与上一个点距离足够时才添加新点
          if (track.path.length === 0 || 
              (track.path.length > 0 && 
               (Math.abs(vehicle.position[0] - track.path[track.path.length-1][0]) > 0.0002 || 
                Math.abs(vehicle.position[1] - track.path[track.path.length-1][1]) > 0.0002))) {
            
            // 添加当前位置到路径，保持路径不超过50个点
            let newPath = [...track.path, [...vehicle.position] as [number, number]];
            if (newPath.length > 50) {
              newPath = newPath.slice(newPath.length - 50);
            }
            updatedTrack.path = newPath;
          }
        }
        
        return updatedTrack;
      });
    });
  };
  
  // 随机改变车辆状态
  const randomUpdateVehicleStatus = () => {
    setVehicles(prev => {
      return prev.map(vehicle => {
        // 10%的概率改变状态
        if (Math.random() > 0.1) return vehicle;
        
        const statuses = ['行驶中', '充电中', '停车'];
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const newBatteryLevel = vehicle.status === '充电中' 
          ? Math.min(100, vehicle.batteryLevel + 10) 
          : Math.max(10, vehicle.batteryLevel - 5);
        
        // 如果从非行驶状态变为行驶状态，清空对应轨迹
        if (newStatus === '行驶中' && vehicle.status !== '行驶中') {
          const trackIndex = tracks.findIndex(t => t.vehicleId === vehicle.id);
          if (trackIndex !== -1) {
            const updatedTracks = [...tracks];
            updatedTracks[trackIndex] = {
              ...updatedTracks[trackIndex],
              path: []
            };
            setTracks(updatedTracks);
          }
        }
        
        return {
          ...vehicle,
          status: newStatus,
          batteryLevel: newBatteryLevel
        };
      });
    });
  };

  // 确保组件已挂载
  useEffect(() => {
    setMounted(true);
    // 初始化车辆数据
    generateInitialVehicles();
    
    // 使用全局 AMap 加载器提前加载
    AMapLoader.load({
      key: '4f73ae034a7bfcad2af62831f9d3685b',
      version: '2.0',
      plugins: ['AMap.HeatMap', 'AMap.MoveAnimation']
    }).catch(e => {
      console.error('地图API预加载失败:', e);
    });
    
    return () => setMounted(false);
  }, []);
  
  // 初始化地图
  useEffect(() => {
    // 确保组件已挂载且mapRef指向的DOM元素存在
    if (mounted && mapRef.current && !mapInstance) {
      try {
        // 使用环境变量中的API密钥或使用临时密钥（仅用于开发）
        const apiKey = '4f73ae034a7bfcad2af62831f9d3685b';
        
        AMapLoader.load({
          key: apiKey,
          version: '2.0',
          plugins: ['AMap.HeatMap', 'AMap.MoveAnimation']
        })
        .then((AMap) => {
          // 确保mapRef.current仍然存在
          if (!mapRef.current) return;
          // 保存AMap到window对象，以便全局访问
          window.AMap = AMap;
          
          const map = new AMap.Map(mapRef.current, {
            viewMode: '3D',
            zoom: 13,
            center: [CENTER_LNG, CENTER_LAT], // 雄安新区中心
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
        })
        .catch(e => {
          console.error('地图加载失败:', e);
        });
      } catch (error) {
        console.error('地图初始化出错:', error);
      }
    }
    
    return () => {
      if (mapInstance) {
        mapInstance.destroy();
      }
    };
  }, [mounted, mapInstance]);
  
  // 定期更新车辆位置
  useEffect(() => {
    if (!mapInstance) return;
    
    const positionInterval = setInterval(() => {
      updateVehiclePositions();
    }, 1000);
    
    // 每10秒随机更新一些车辆状态
    const statusInterval = setInterval(() => {
      randomUpdateVehicleStatus();
    }, 10000);
    
    return () => {
      clearInterval(positionInterval);
      clearInterval(statusInterval);
    };
  }, [mapInstance, vehicles]);
  
  // 更新热力图和车辆标记
  useEffect(() => {
    if (!mapInstance || !heatmapLayer || vehicles.length === 0 || !window.AMap) return;
    
    try {
      // 更新热力图数据
      const heatmapData = generateHeatmapData(vehicles);
      if (heatmapData.length > 0) {
        heatmapLayer.setDataSet({
          data: heatmapData,
          max: 100
        });
      }
      
      // 清除旧的车辆标记
      vehicleMarkers.forEach(marker => {
        if (marker && mapInstance) {
          mapInstance.remove(marker);
        }
      });
      
      // 清除旧的路径线
      pathLines.forEach(line => {
        if (line && mapInstance) {
          mapInstance.remove(line);
        }
      });
      
      const newMarkers = [];
      const newPathLines = [];
      
      // 添加新的车辆标记
      vehicles.forEach(vehicle => {
        // 创建车辆信息窗内容
        const content = `
          <div style="padding: 10px; background: rgba(0,0,0,0.7); border-radius: 8px; color: white; max-width: 200px;">
            <div style="font-weight: bold; margin-bottom: 5px;">${vehicle.licensePlate} (${vehicle.model})</div>
            <div>状态: ${vehicle.status}</div>
            <div>电量: ${vehicle.batteryLevel}%</div>
            <div>速度: ${Math.round(vehicle.speed)} km/h</div>
            <div>总里程: ${vehicle.mileage} km</div>
            <div>总减排: ${vehicle.carbonReduction} kg</div>
          </div>
        `;
        
        // 创建标记 - 使用正确的AMap API
        const marker = new window.AMap.Marker({
          position: vehicle.position,
          content: `<div style="background-color: ${
            vehicle.status === '行驶中' ? '#52c41a' : 
            vehicle.status === '充电中' ? '#1890ff' : '#faad14'
          }; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white;"></div>`,
          offset: new window.AMap.Pixel(-5, -5),
          extData: vehicle
        });
        
        // 添加点击事件
        marker.on('click', () => {
          const infoWindow = new window.AMap.InfoWindow({
            content,
            offset: new window.AMap.Pixel(0, -15)
          });
          infoWindow.open(mapInstance, marker.getPosition());
        });
        
        // 添加到地图
        marker.setMap(mapInstance);
        newMarkers.push(marker);
      });
      
      // 分开绘制轨迹线
      tracks.forEach(track => {
        if (track.path && track.path.length > 1) {
          try {
            const pathLine = new window.AMap.Polyline({
              path: track.path,
              strokeColor: track.status === '行驶中' ? '#52c41a' : '#aaa',
              strokeWeight: 3,
              strokeOpacity: 0.8,
              showDir: true
            });
            
            pathLine.setMap(mapInstance);
            newPathLines.push(pathLine);
          } catch (error) {
            console.error('绘制轨迹线出错:', error);
          }
        }
      });
      
      setVehicleMarkers(newMarkers);
      setPathLines(newPathLines);
    } catch (error) {
      console.error('更新地图数据出错:', error);
    }
  }, [vehicles, tracks, mapInstance, heatmapLayer]);

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