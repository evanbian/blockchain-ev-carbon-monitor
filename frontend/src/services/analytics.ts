// src/services/analytics.ts
import api from './api';
import config from '@/config';

const analyticsAPI = {
  /**
   * 获取碳减排总览数据
   * @param params 查询参数 (startDate, endDate)
   * @returns 碳减排总览数据
   */
  getCarbonSummary: async (params: any) => {
    return api.get(`${config.api.analyticsUrl}/carbon-reduction/summary`, { params });
  },
  
  /**
   * 获取碳减排趋势数据
   * @param params 查询参数 (startDate, endDate, groupBy)
   * @returns 碳减排趋势数据
   */
  getCarbonTrends: async (params: any) => {
    return api.get(`${config.api.analyticsUrl}/carbon-reduction/trends`, { params });
  },
  
  /**
   * 获取车型碳减排对比数据
   * @param params 查询参数 (startDate, endDate)
   * @returns 车型碳减排对比数据
   */
  getCarbonByModel: async (params: any) => {
    return api.get(`${config.api.analyticsUrl}/carbon-reduction/by-model`, { params });
  },
  
  /**
   * 获取车辆行驶数据
   * @param params 查询参数 (vin, startDate, endDate, metrics)
   * @returns 车辆行驶数据
   */
  getDrivingData: async (params: any) => {
    return api.get(`${config.api.analyticsUrl}/driving-data`, { params });
  },
  
  /**
   * 获取预测数据
   * @param params 查询参数 (vin, period, count)
   * @returns 预测数据
   */
  getPredictions: async (params: any) => {
    return api.get(`${config.api.analyticsUrl}/predictions`, { params });
  },
  
  /**
   * 获取热力图数据
   * @param params 查询参数 (date, resolution)
   * @returns 热力图数据
   */
  getHeatmapData: async (params: any) => {
    return api.get(`${config.api.analyticsUrl}/heatmap`, { params });
  }
};

export default analyticsAPI;