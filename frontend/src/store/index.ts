// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import vehicleReducer from './slices/vehicleSlice';
import analyticsReducer from './slices/analyticsSlice'; // 修改这一行，去掉 default 导入

export const store = configureStore({
  reducer: {
    vehicles: vehicleReducer,
    analytics: analyticsReducer,
    // 后续会添加更多reducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;