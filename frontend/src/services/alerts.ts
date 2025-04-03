// src/services/alerts.ts
// import api from './api';
// import config from '@/config';

// const alertsAPI = {
//   /**
//    * 获取告警列表
//    * @param params 查询参数 (page, size, level, status, vin)
//    * @returns 告警列表数据
//    */
//   getAlerts: async (params: any) => {
//     return api.get(`${config.api.alertsUrl}`, { params });
//   },
  
//   /**
//    * 获取告警详情
//    * @param id 告警ID
//    * @returns 告警详情
//    */
//   getAlertById: async (id: string) => {
//     return api.get(`${config.api.alertsUrl}/${id}`);
//   },
  
//   /**
//    * 更新告警状态
//    * @param id 告警ID
//    * @param data 更新数据 (status, comment)
//    * @returns 更新结果
//    */
//   updateAlertStatus: async (id: string, data: any) => {
//     return api.put(`${config.api.alertsUrl}/${id}/status`, data);
//   }
// };

// export default alertsAPI;


// 修改 src/services/alerts.ts 添加模拟数据

// 模拟告警数据
const mockAlerts = Array.from({ length: 30 }).map((_, index) => {
    const levels = ['high', 'medium', 'low'];
    const types = ['data_anomaly', 'energy_anomaly', 'system_error', 'connection_lost'];
    const statuses = ['new', 'acknowledged', 'resolved'];
    const messages = [
      '能耗数据异常波动',
      '电池温度异常升高',
      '车辆数据传输中断',
      '车辆位置异常漂移',
      '电池电量异常下降',
      '系统响应超时',
      '定位信号丢失'
    ];
    const vins = [
      'LSVAU2180N2183294',
      'LNBSCCAK7JW217931',
      'WVWZZZ1KZAP035125'
    ];
    const licensePlates = ['京A12345', '京B54321', '京C98765'];
    const models = ['比亚迪汉EV', '特斯拉Model 3', '蔚来ES6'];
    
    const level = levels[Math.floor(Math.random() * levels.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const vinIndex = Math.floor(Math.random() * vins.length);
    // 新告警概率高一些
    const status = Math.random() > 0.6 ? 'new' : 
                   Math.random() > 0.5 ? 'acknowledged' : 'resolved';
    
    // 生成随机日期，最近10天内
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 10));
    
    return {
      id: `ALT${100000 + index}`,
      vin: vins[vinIndex],
      licensePlate: licensePlates[vinIndex],
      model: models[vinIndex],
      type,
      level,
      message: messages[Math.floor(Math.random() * messages.length)],
      detail: `车辆${licensePlates[vinIndex]}出现${messages[Math.floor(Math.random() * messages.length)]}，请检查车辆状态。`,
      time: date.toISOString(),
      status,
      relatedData: {
        timestamp: date.toISOString(),
        normalValue: (Math.random() * 100).toFixed(2),
        anomalyValue: (Math.random() * 100 + 50).toFixed(2)
      }
    };
  });
  
  const alertsAPI = {
    /**
     * 获取告警列表
     * @param params 查询参数 (page, size, level, status, vin)
     * @returns 告警列表数据
     */
    getAlerts: async (params: any) => {
      // 模拟API调用
      return new Promise((resolve) => {
        setTimeout(() => {
          // 应用筛选条件
          let filteredAlerts = [...mockAlerts];
          
          if (params.level && params.level !== 'all') {
            filteredAlerts = filteredAlerts.filter(alert => alert.level === params.level);
          }
          
          if (params.status && params.status !== 'all') {
            filteredAlerts = filteredAlerts.filter(alert => alert.status === params.status);
          }
          
          if (params.vin) {
            filteredAlerts = filteredAlerts.filter(alert => alert.vin === params.vin);
          }
          
          if (params.startDate && params.endDate) {
            const startDate = new Date(params.startDate);
            const endDate = new Date(params.endDate);
            endDate.setHours(23, 59, 59, 999); // 设置为当天结束时间
            
            filteredAlerts = filteredAlerts.filter(alert => {
              const alertDate = new Date(alert.time);
              return alertDate >= startDate && alertDate <= endDate;
            });
          }
          
          // 计算分页
          const page = params.page || 1;
          const size = params.size || 10;
          const start = (page - 1) * size;
          const end = start + size;
          
          // 模拟分页数据
          const paginatedAlerts = filteredAlerts.slice(start, end);
          
          resolve({
            success: true,
            code: 200,
            message: '获取成功',
            data: {
              total: filteredAlerts.length,
              page,
              size,
              items: paginatedAlerts
            }
          });
        }, 500); // 模拟网络延迟
      });
    },
    
    /**
     * 获取告警详情
     * @param id 告警ID
     * @returns 告警详情
     */
    getAlertById: async (id: string) => {
      // 模拟API调用
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const alert = mockAlerts.find(alert => alert.id === id);
          
          if (!alert) {
            reject(new Error('告警不存在'));
            return;
          }
          
          resolve({
            success: true,
            code: 200,
            message: '获取成功',
            data: alert
          });
        }, 300); // 模拟网络延迟
      });
    },
    
    /**
     * 更新告警状态
     * @param id 告警ID
     * @param data 更新数据 (status, comment)
     * @returns 更新结果
     */
    updateAlertStatus: async (id: string, data: any) => {
      // 模拟API调用
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const alertIndex = mockAlerts.findIndex(alert => alert.id === id);
          
          if (alertIndex === -1) {
            reject(new Error('告警不存在'));
            return;
          }
          
          // 更新告警状态
          mockAlerts[alertIndex].status = data.status;
          
          resolve({
            success: true,
            code: 200,
            message: '更新成功',
            data: {
              id,
              status: data.status
            }
          });
        }, 300); // 模拟网络延迟
      });
    }
  };
  
  export default alertsAPI;