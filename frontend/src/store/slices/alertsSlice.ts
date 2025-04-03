// src/store/slices/alertsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Alert {
  id: string;
  vin: string;
  type: string;
  level: string;
  message: string;
  time: string;
  status: string;
  // 更多属性...
}

interface AlertsState {
  alerts: Alert[];
  totalAlerts: number;
  currentAlert: Alert | null;
  loading: boolean;
  error: string | null;
}

const initialState: AlertsState = {
  alerts: [],
  totalAlerts: 0,
  currentAlert: null,
  loading: false,
  error: null
};

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    fetchAlertsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchAlertsSuccess(state, action: PayloadAction<{items: Alert[], total: number}>) {
      state.alerts = action.payload.items;
      state.totalAlerts = action.payload.total;
      state.loading = false;
    },
    fetchAlertByIdSuccess(state, action: PayloadAction<Alert>) {
      state.currentAlert = action.payload;
      state.loading = false;
    },
    updateAlertStatusSuccess(state, action: PayloadAction<{id: string, status: string}>) {
      const { id, status } = action.payload;
      state.alerts = state.alerts.map(alert => 
        alert.id === id ? {...alert, status} : alert
      );
      if (state.currentAlert && state.currentAlert.id === id) {
        state.currentAlert = {...state.currentAlert, status};
      }
      state.loading = false;
    },
    fetchAlertsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
  fetchAlertsStart,
  fetchAlertsSuccess,
  fetchAlertByIdSuccess,
  updateAlertStatusSuccess,
  fetchAlertsFailure
} = alertsSlice.actions;

export default alertsSlice.reducer;