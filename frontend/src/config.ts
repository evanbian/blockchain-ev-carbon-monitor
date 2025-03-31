// src/config.ts

/**
 * 全局配置文件
 */

// 环境变量
const ENV = import.meta.env.MODE || 'development';

// API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// 区块链节点URL
const WEB3_PROVIDER = import.meta.env.VITE_WEB3_PROVIDER || 'http://localhost:8545';

// 系统角色
export enum Role {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  VIEWER = 'viewer'
}

// 车辆状态
export enum VehicleStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  ERROR = 'error'
}

// 分页默认值
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_SIZES = ['10', '20', '50', '100'];

// 导出基础配置
export default {
  env: ENV,
  isDev: ENV === 'development',
  isProd: ENV === 'production',
  api: {
    baseUrl: API_BASE_URL,
    timeout: 20000,  // 默认请求超时时间: 20s
    vehiclesUrl: `${API_BASE_URL}/v1/vehicles`,  // 确保这里是v1/vehicles
    analyticsUrl: `${API_BASE_URL}/v1/analytics`,
    blockchainUrl: `${API_BASE_URL}/v1/blockchain`,
    creditsUrl: `${API_BASE_URL}/v1/credits`,
    configUrl: `${API_BASE_URL}/v1/config`,
    alertsUrl: `${API_BASE_URL}/v1/alerts`,
  },
  blockchain: {
    provider: WEB3_PROVIDER,
  },
  storage: {
    tokenKey: 'ev-carbon-token',
    userKey: 'ev-carbon-user',
  },
};
