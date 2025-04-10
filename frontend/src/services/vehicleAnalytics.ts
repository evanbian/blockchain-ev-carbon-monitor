// src/services/vehicleAnalytics.ts
import api from './api';
import { DrivingData, DrivingTimeSeriesPoint, HeatmapDataPoint, PredictionData } from '@/types/analytics'; // Assuming types are defined or will be

// Define types matching backend DTOs (or import from a shared types file)
// If you haven't defined these types in @/types/analytics yet, define them here or in a central place
interface DrivingDataResponse {
  // Matches backend DrivingData DTO
  totalMileage: number;
  totalEnergy: number;
  totalCarbonReduction: number;
  averageEfficiency: number; // Renamed from energyPer100km for consistency? Check backend DTO again if needed. Let's assume averageEfficiency matches DTO
}

interface DrivingTimeSeriesResponse extends Array<DrivingTimeSeriesPointResponse> {} // Matches List<DrivingTimeSeriesPoint>
interface DrivingTimeSeriesPointResponse {
  // Matches backend DrivingTimeSeriesPoint DTO
  date: string;
  mileage: number;
  energy: number;
  carbonReduction: number;
  energyPer100km: number; // Matches backend DTO field name
}

interface HeatmapResponse extends Array<HeatmapDataPointResponse> {} // Matches List<HeatmapDataPoint>
interface HeatmapDataPointResponse {
  // Matches backend HeatmapDataPoint DTO
  lat: number;
  lng: number;
  count: number;
}

// Prediction type (example, adjust based on actual data/DTO)
interface PredictionResponse extends Array<PredictionDataResponse> {}
interface PredictionDataResponse {
    date: string;
    carbonReduction: number;
    credits: number; // Assuming prediction includes credits
}


const vehicleAnalyticsAPI = {
  /**
   * 获取车辆汇总行驶数据
   */
  getDrivingSummary: async (vin: string, startDate: string, endDate: string) => {
    const params = { startDate, endDate };
    // Expecting ApiResponse<DrivingData> from backend
    const response = await api.get<{ data: DrivingDataResponse }>(`/api/v1/vehicles/${vin}/analytics`, { params });
    return response.data; // Return the data part assuming ApiResponse wrapper is handled by interceptor or here
  },

  /**
   * 获取车辆行驶时间序列数据
   */
  getDrivingTimeSeries: async (vin: string, startDate: string, endDate: string, groupBy: 'day' | 'week' | 'month' = 'day') => {
    const params = { startDate, endDate, groupBy };
    // Expecting ApiResponse<List<DrivingTimeSeriesPoint>>
    const response = await api.get<{ data: DrivingTimeSeriesResponse }>(`/api/v1/vehicles/${vin}/analytics/timeseries`, { params });
     return response.data;
  },

  /**
   * 获取车辆热力图数据
   */
  getVehicleHeatmap: async (vin: string, startDate: string, endDate: string, valueType: 'frequency' | 'carbonReduction' | 'duration' = 'frequency') => {
    const params = { startDate, endDate, valueType };
    // Expecting ApiResponse<List<HeatmapDataPoint>>
    const response = await api.get<{ data: HeatmapResponse }>(`/api/v1/vehicles/${vin}/analytics/heatmap`, { params });
     return response.data;
  },

  /**
   * 获取车辆预测数据
   */
  getVehiclePredictions: async (vin: string, period: 'day' | 'week' | 'month' = 'day', count: number = 7) => {
     const params = { period, count };
     // Expecting ApiResponse<List<PredictionData>> - using Map temporarily
     const response = await api.get<{ data: PredictionResponse }>(`/api/v1/vehicles/${vin}/analytics/predictions`, { params });
     return response.data;
   },
};

export default vehicleAnalyticsAPI;
