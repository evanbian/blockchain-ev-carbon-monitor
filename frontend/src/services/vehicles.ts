// src/services/vehicles.ts
import api from './api';
import { Vehicle } from '@/types/vehicle';

const vehicleAPI = {
  getVehicles: async (params: any) => {
    const response = await api.get('/v1/vehicles', { params });
    return response.data;
  },
  
  getVehicleById: async (vin: string) => {
    const response = await api.get(`/v1/vehicles/${vin}`);
    return response.data;
  },
  
  createVehicle: async (vehicle: Partial<Vehicle>) => {
    const response = await api.post('/v1/vehicles', vehicle);
    return response.data;
  },
  
  updateVehicle: async (vin: string, vehicle: Partial<Vehicle>) => {
    const response = await api.put(`/v1/vehicles/${vin}`, vehicle);
    return response.data;
  },
  
  deleteVehicle: async (vin: string) => {
    const response = await api.delete(`/v1/vehicles/${vin}`);
    return response.data;
  },
};

export default vehicleAPI;
