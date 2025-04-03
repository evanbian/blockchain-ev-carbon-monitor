// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import vehicleReducer from './slices/vehicleSlice';
import analyticsReducer from './slices/analyticsSlice';
import alertsReducer from './slices/alertsSlice'; // 新增

export const store = configureStore({
  reducer: {
    vehicles: vehicleReducer,
    analytics: analyticsReducer,
    alerts: alertsReducer, // 新增
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;