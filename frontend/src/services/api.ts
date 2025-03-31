// src/services/api.ts
import axios from 'axios';
import config from '@/config';

const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器，添加token
api.interceptors.request.use(
  (reqConfig) => {
    const token = localStorage.getItem(config.storage.tokenKey);
    if (token && reqConfig.headers) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
    return reqConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器，处理错误
api.interceptors.response.use(
  (response) => {
    // 处理我们后端的统一响应格式
    if (response.data && typeof response.data === 'object') {
      // 检查是否是我们的API响应格式
      if (response.data.hasOwnProperty('success')) {
        if (response.data.success) {
          // 成功响应，返回data部分
          return response.data;
        } else {
          // 业务逻辑错误
          return Promise.reject({
            response: {
              status: response.data.code || 400,
              data: response.data
            }
          });
        }
      }
    }
    // 直接返回响应
    return response;
  },
  (error) => {
    // 处理401等错误
    if (error.response && error.response.status === 401) {
      // 清除token并重定向到登录页
      localStorage.removeItem(config.storage.tokenKey);
      localStorage.removeItem(config.storage.userKey);
      window.location.href = '/login';
    }
    
    // 统一处理错误信息
    let errorMsg = '未知错误';
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        errorMsg = error.response.data.message;
      } else if (error.response.data.error) {
        errorMsg = error.response.data.error;
      }
    } else if (error.message) {
      errorMsg = error.message;
    }
    
    console.error('API错误:', errorMsg);
    return Promise.reject(error);
  }
);

export default api;
