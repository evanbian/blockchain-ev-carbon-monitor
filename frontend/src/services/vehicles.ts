// frontend/src/services/vehicles.ts
import api from './api';
// import config from '@/config'; // No longer needed for base URLs here
import { Vehicle } from '@/types/vehicle';

const VEHICLE_API_PATH = '/api/v1/vehicles'; // Define base path consistently

const vehicleAPI = {
  // baseUrl: config.api.baseUrl, // Remove unused property
  /**
   * 获取车辆列表
   * @param params 查询参数 (page, size, status, sort, order)
   * @returns 车辆列表和分页信息
   */
  getVehicles: async (params: any) => {
    return api.get(VEHICLE_API_PATH, { params });
  },
  
  /**
   * 获取车辆详情
   * @param vin 车辆VIN码
   * @returns 车辆详情
   */
  getVehicleById: async (vin: string) => {
    return api.get(`${VEHICLE_API_PATH}/${vin}`);
  },
  
  /**
   * 创建车辆
   * @param vehicle 车辆信息
   * @returns 创建结果
   */
  createVehicle: async (vehicle: Partial<Vehicle>) => {
    return api.post(VEHICLE_API_PATH, vehicle);
  },
  
  /**
   * 更新车辆信息
   * @param vin 车辆VIN码
   * @param vehicle 要更新的车辆信息
   * @returns 更新结果
   */
  updateVehicle: async (vin: string, vehicle: Partial<Vehicle>) => {
    return api.put(`${VEHICLE_API_PATH}/${vin}`, vehicle);
  },
  
  /**
   * 删除车辆
   * @param vin 车辆VIN码
   * @returns 删除结果
   */
  deleteVehicle: async (vin: string) => {
    return api.delete(`${VEHICLE_API_PATH}/${vin}`);
  },

  /**
   * 调试: 获取所有车辆
   * @returns 所有车辆列表
   */
  getAllVehiclesDebug: async () => {
    console.log("调用调试API获取所有车辆");
    // Adjust debug path as well
    const response = await api.get(`${VEHICLE_API_PATH}/debug/all`);
    console.log("调试API响应:", response);
    return response;
  },
  
  /**
   * 批量导入车辆
   * @param file CSV文件
   * @returns 导入结果
   */
  importVehicles: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Adjust batch path as well
    return api.post(`${VEHICLE_API_PATH}/batch`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export default vehicleAPI;
