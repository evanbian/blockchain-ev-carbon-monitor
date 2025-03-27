// src/types/vehicle.ts
export interface Vehicle {
  vin: string;
  model: string;
  licensePlate: string;
  manufacturer: string;
  productionYear: number;
  batteryCapacity: number;
  maxRange: number;
  registerDate: string;
  status: string;
  lastUpdateTime: string;
  totalMileage: number;
  totalEnergy: number;
  totalCarbonReduction: number;
  carbonCredits: number;
}
