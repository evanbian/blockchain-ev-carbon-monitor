// src/services/alerts.ts
import api from './api'; // Assuming api instance is configured correctly
// Assuming config is not needed or baseURL is set in api instance
// import config from '@/config';

// Define a type for the paginated response (matching backend ApiResponse<Page<AlertDTO>>)
interface PaginatedAlertsResponse {
  content: any[]; // Array of AlertDTO like objects
  pageable: {
    pageNumber: number;
    pageSize: number;
    // ... other pageable fields
  };
  totalElements: number;
  totalPages: number;
  // ... other Page fields
}

// Define a type for the single alert response (matching backend ApiResponse<AlertDTO>)
interface SingleAlertResponse {
  // Define AlertDTO structure based on backend or use any for now
  id: string;
  vin: string;
  licensePlate?: string;
  model?: string;
  type: string; // Use string representations of enums for simplicity here
  level: string;
  message: string;
  detail?: string;
  time: string; // ISO string
  status: string;
  relatedData?: string;
  comment?: string;
  createdAt: string; // ISO string
}

// Define a type for the update status payload
interface UpdateStatusPayload {
  status: string; // e.g., "ACKNOWLEDGED", "RESOLVED"
  comment?: string;
}

// Enable the real API calls
const alertsAPI = {
  /**
   * 获取告警列表
   * @param params 查询参数 (page, size, level, status, vin, startDate, endDate)
   * @returns Promise resolving to the API response containing paginated alerts
   */
  getAlerts: async (params: any) => {
    // Convert page number for Spring Data Pageable (starts from 0)
    const queryParams = { ...params };
    if (queryParams.page) {
      queryParams.page = queryParams.page - 1; // Adjust page index
    }
    // Path should now include /api/v1 since baseURL no longer contains /api
    return api.get<PaginatedAlertsResponse>('/api/v1/alerts', { params: queryParams });
  },
  
  /**
   * 获取告警详情
   * @param id 告警ID
   * @returns Promise resolving to the API response containing alert details
   */
  getAlertById: async (id: string) => {
    // Path should now include /api/v1
    return api.get<SingleAlertResponse>(`/api/v1/alerts/${id}`);
  },
  
  /**
   * 更新告警状态
   * @param id 告警ID
   * @param data 更新数据 (status, comment)
   * @returns Promise resolving to the API response containing updated alert data
   */
  updateAlertStatus: async (id: string, data: UpdateStatusPayload) => {
    // Path should now include /api/v1
    return api.put<SingleAlertResponse>(`/api/v1/alerts/${id}/status`, data);
  }
};

export default alertsAPI;