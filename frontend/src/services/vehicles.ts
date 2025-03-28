// src/services/vehicles.ts
import api from './api';
import config from '@/config';
import { Vehicle } from '@/types/vehicle';

const vehicleAPI = {
  /**
   * 获取车辆列表
   * @param params 查询参数 (page, size, status, sort, order)
   * @returns 车辆列表和分页信息
   */
  getVehicles: async (params: any) => {
    return api.get(config.api.vehiclesUrl, { params });
  },
  
  /**
   * 获取车辆详情
   * @param vin 车辆VIN码
   * @returns 车辆详情
   */
  getVehicleById: async (vin: string) => {
    return api.get(`${config.api.vehiclesUrl}/${vin}`);
  },
  
  /**
   * 创建车辆
   * @param vehicle 车辆信息
   * @returns 创建结果
   */
  createVehicle: async (vehicle: Partial<Vehicle>) => {
    return api.post(config.api.vehiclesUrl, vehicle);
  },
  
  /**
   * 更新车辆信息
   * @param vin 车辆VIN码
   * @param vehicle 要更新的车辆信息
   * @returns 更新结果
   */
  updateVehicle: async (vin: string, vehicle: Partial<Vehicle>) => {
    return api.put(`${config.api.vehiclesUrl}/${vin}`, vehicle);
  },
  
  /**
   * 删除车辆
   * @param vin 车辆VIN码
   * @returns 删除结果
   */
  deleteVehicle: async (vin: string) => {
    return api.delete(`${config.api.vehiclesUrl}/${vin}`);
  },
  
  /**
   * 批量导入车辆
   * @param file CSV文件
   * @returns 导入结果
   */
  importVehicles: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post(`${config.api.vehiclesUrl}/batch`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  /**
   * 获取车辆行驶数据
   * @param vin 车辆VIN码
   * @param params 查询参数 (startDate, endDate)
   * @returns 行驶数据
   */
  getVehicleDrivingData: async (vin: string, params: any) => {
    return api.get(`${config.api.analyticsUrl}/driving-data`, { 
      params: { vin, ...params } 
    });
  },
  
  /**
   * 获取车辆碳减排数据
   * @param vin 车辆VIN码
   * @param params 查询参数 (startDate, endDate)
   * @returns 碳减排数据
   */
  getVehicleCarbonData: async (vin: string, params: any) => {
    return api.get(`${config.api.analyticsUrl}/carbon-reduction/vehicle`, { 
      params: { vin, ...params } 
    });
  },
};

export default vehicleAPI;
