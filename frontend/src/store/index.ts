// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import vehicleReducer from './slices/vehicleSlice';

export const store = configureStore({
  reducer: {
    vehicles: vehicleReducer,
    // 后续会添加更多reducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
