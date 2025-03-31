// src/store/slices/vehicleSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Vehicle {
  vin: string;
  model: string;
  licensePlate: string;
  manufacturer: string;
  status: string;
  lastUpdateTime: string;
}

interface VehicleState {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
}

const initialState: VehicleState = {
  vehicles: [],
  loading: false,
  error: null,
};

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    fetchVehiclesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchVehiclesSuccess(state, action: PayloadAction<Vehicle[]>) {
      state.vehicles = action.payload;
      state.loading = false;
    },
    fetchVehiclesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});


export const { fetchVehiclesStart, fetchVehiclesSuccess, fetchVehiclesFailure } = vehicleSlice.actions;
export default vehicleSlice.reducer;
