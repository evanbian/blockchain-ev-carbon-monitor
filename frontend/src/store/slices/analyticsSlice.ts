// src/store/slices/analyticsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 定义分析状态接口
interface AnalyticsState {
  carbonSummary: any;
  carbonTrends: any[];
  carbonByModel: any[];
  drivingData: any;
  predictions: any[];
  loading: boolean;
  error: string | null;
}

// 初始状态
const initialState: AnalyticsState = {
  carbonSummary: null,
  carbonTrends: [],
  carbonByModel: [],
  drivingData: null,
  predictions: [],
  loading: false,
  error: null,
};

// 创建分析状态slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCarbonSummarySuccess(state, action: PayloadAction<any>) {
      state.carbonSummary = action.payload;
      state.loading = false;
    },
    fetchCarbonTrendsSuccess(state, action: PayloadAction<any[]>) {
      state.carbonTrends = action.payload;
      state.loading = false;
    },
    fetchCarbonByModelSuccess(state, action: PayloadAction<any[]>) {
      state.carbonByModel = action.payload;
      state.loading = false;
    },
    fetchDrivingDataSuccess(state, action: PayloadAction<any>) {
      state.drivingData = action.payload;
      state.loading = false;
    },
    fetchPredictionsSuccess(state, action: PayloadAction<any[]>) {
      state.predictions = action.payload;
      state.loading = false;
    },
    fetchDataFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    clearAnalyticsData(state) {
      state.carbonSummary = null;
      state.carbonTrends = [];
      state.carbonByModel = [];
      state.drivingData = null;
      state.predictions = [];
    },
  },
});

// 导出actions
export const {
    fetchDataStart,
    fetchCarbonSummarySuccess,
    fetchCarbonTrendsSuccess,
    fetchCarbonByModelSuccess,
    fetchDrivingDataSuccess,
    fetchPredictionsSuccess,
    fetchDataFailure,
    clearAnalyticsData,
  } = analyticsSlice.actions;
  
  // 导出reducer (命名导出而非默认导出)
  export default analyticsSlice.reducer;