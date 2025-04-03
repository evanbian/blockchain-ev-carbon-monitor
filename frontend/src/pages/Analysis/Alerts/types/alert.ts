// src/pages/Analysis/Alerts/types/alert.ts
export interface Alert {
    id: string;
    vin: string;
    type: string;
    level: 'high' | 'medium' | 'low';
    message: string;
    detail?: string;
    time: string;
    status: 'new' | 'acknowledged' | 'resolved';
    licensePlate?: string;
    model?: string;
    relatedData?: any;
  }
  
  export interface AlertQueryParams {
    page?: number;
    size?: number;
    level?: string;
    status?: string;
    vin?: string;
    startDate?: string;
    endDate?: string;
  }
  
  export interface AlertStatusUpdate {
    status: string;
    comment?: string;
  }