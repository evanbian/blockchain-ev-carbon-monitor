// src/services/analytics.ts
import api from './api';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/en'; // Import English locale for formatting consistency

export interface CarbonSummary {
  totalReduction: number;
  comparedToFuel: number;
  economicValue: number;
  equivalentTrees: number;
  vehicleCount: number;
}

export interface CarbonTrend {
  date: string;
  reduction: number;
  credits: number;
}

export interface CarbonModelData {
  model: string;
  reduction: number;
  percentage: number;
  vehicleCount: number;
}

export interface DrivingData {
  totalMileage: number;
  totalEnergy: number;
  totalReduction: number;
  efficiency: number;
}

export interface PredictionData {
  date: string;
  carbonReduction: number;
  credits: number;
}

export interface HeatmapDataPoint {
  lat: number;
  lng: number;
  count: number;
}

interface TimelineResponse {
  timeline: CarbonTrend[];
}

interface ModelsResponse {
  models: CarbonModelData[];
}

export async function getCarbonSummary(
  startDate: string,
  endDate: string,
  vehicleId?: string
) {
  return api.get<CarbonSummary>('/api/v1/analytics/carbon/summary', {
    params: {
      startDate,
      endDate,
      vehicleId,
    },
  });
}

export async function getCarbonTrends(
  startDate: string,
  endDate: string,
  groupBy: 'day' | 'week' | 'month',
  vehicleId?: string
) {
  return api.get<TimelineResponse>('/api/v1/analytics/carbon/trends', {
    params: {
      startDate,
      endDate,
      groupBy,
      vehicleId,
    },
  });
}

export async function getCarbonByModel(
  startDate: string,
  endDate: string,
  vehicleId?: string
) {
  return api.get<ModelsResponse>('/api/v1/analytics/carbon/by-model', {
    params: {
      startDate,
      endDate,
      vehicleId,
    },
  });
}

export async function getDrivingData(
  vin: string,
  startDate: Dayjs,
  endDate: Dayjs,
  metrics: string[]
) {
  return api.get<DrivingData>(`/api/v1/analytics/driving/${vin}`, {
    params: {
      startDate: startDate.format('YYYY-MM-DDTHH:mm:ss'),
      endDate: endDate.format('YYYY-MM-DDTHH:mm:ss'),
      metrics: metrics,
    },
  });
}

export async function getPredictions(
  vin: string,
  period: 'day' | 'week' | 'month',
  count: number
) {
  return api.get<PredictionData[]>(`/api/v1/analytics/predictions/${vin}`, {
    params: {
      period,
      count,
    },
  });
}

export async function getHeatmapData(date: Dayjs, resolution: string) {
  return api.get<HeatmapDataPoint[]>('/api/v1/analytics/heatmap', {
    params: {
      date: date.format('YYYY-MM-DDTHH:mm:ss'),
      resolution,
    },
  });
}