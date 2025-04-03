// tools/data-generator/models/drivingModel.js
const logger = require('../utils/logger');
const { VIN_REGEX } = require('./vehicleModel');

/**
 * 行驶数据模型定义和验证
 */
class DrivingModel {
  /**
   * 可能的异常类型
   */
  static ANOMALY_TYPES = ['energy_anomaly', 'position_anomaly', 'speed_anomaly'];
  
  /**
   * 创建行驶数据模型实例
   * @param {Object} data 行驶数据
   */
  constructor(data = {}) {
    this.id = data.id || generateId();
    this.vin = data.vin || '';
    this.timestamp = data.timestamp || new Date().toISOString();
    this.mileage = data.mileage || 0;
    this.energyConsumption = data.energyConsumption || 0;
    this.speed = data.speed !== undefined ? data.speed : 0;
    this.batteryLevel = data.batteryLevel !== undefined ? data.batteryLevel : 100;
    this.position = data.position || [0, 0]; // [longitude, latitude]
    this.isAbnormal = data.isAbnormal || false;
    this.abnormalType = data.abnormalType || null;
    this.createdAt = data.createdAt || new Date().toISOString();
  }
  
  /**
   * 验证行驶数据
   * @returns {Object} 验证结果，包含是否通过和错误信息
   */
  validate() {
    const errors = [];
    
    // 验证VIN码
    if (!this.vin) {
      errors.push({ field: 'vin', message: 'VIN码不能为空' });
    } else if (!VIN_REGEX.test(this.vin)) {
      errors.push({ field: 'vin', message: 'VIN码格式不正确，应为17位字母数字组合(不包含I,O,Q)' });
    }
    
    // 验证时间戳
    if (!this.timestamp) {
      errors.push({ field: 'timestamp', message: '时间戳不能为空' });
    } else {
      try {
        new Date(this.timestamp);
      } catch (e) {
        errors.push({ field: 'timestamp', message: '时间戳格式不正确' });
      }
    }
    
    // 验证里程
    if (this.mileage < 0) {
      errors.push({ field: 'mileage', message: '里程不能为负数' });
    }
    
    // 验证能耗
    if (this.energyConsumption < 0) {
      errors.push({ field: 'energyConsumption', message: '能耗不能为负数' });
    }
    
    // 验证速度
    if (this.speed < 0) {
      errors.push({ field: 'speed', message: '速度不能为负数' });
    }
    
    // 验证电池电量
    if (this.batteryLevel < 0 || this.batteryLevel > 100) {
      errors.push({ field: 'batteryLevel', message: '电池电量应在0-100之间' });
    }
    
    // 验证位置
    if (!Array.isArray(this.position) || this.position.length !== 2) {
      errors.push({ field: 'position', message: '位置应为[经度, 纬度]格式的数组' });
    } else {
      const [longitude, latitude] = this.position;
      
      if (longitude < -180 || longitude > 180) {
        errors.push({ field: 'position', message: '经度应在-180到180之间' });
      }
      
      if (latitude < -90 || latitude > 90) {
        errors.push({ field: 'position', message: '纬度应在-90到90之间' });
      }
    }
    
    // 验证异常类型
    if (this.isAbnormal && this.abnormalType && !DrivingModel.ANOMALY_TYPES.includes(this.abnormalType)) {
      errors.push({ 
        field: 'abnormalType', 
        message: `异常类型无效，应为 ${DrivingModel.ANOMALY_TYPES.join(', ')} 其中之一` 
      });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * 转换为JSON
   * @returns {Object} JSON对象
   */
  toJSON() {
    return {
      id: this.id,
      vin: this.vin,
      timestamp: this.timestamp,
      mileage: this.mileage,
      energyConsumption: this.energyConsumption,
      speed: this.speed,
      batteryLevel: this.batteryLevel,
      position: this.position,
      isAbnormal: this.isAbnormal,
      abnormalType: this.abnormalType,
      createdAt: this.createdAt
    };
  }
  
  /**
   * 计算能源效率
   * @returns {number} 能源效率 (km/kWh)
   */
  calculateEnergyEfficiency() {
    if (this.energyConsumption === 0) return 0;
    return this.mileage / this.energyConsumption;
  }
  
  /**
   * 标记为异常数据
   * @param {string} type 异常类型
   * @returns {DrivingModel} 更新后的实例
   */
  markAsAbnormal(type) {
    this.isAbnormal = true;
    
    if (DrivingModel.ANOMALY_TYPES.includes(type)) {
      this.abnormalType = type;
    } else {
      logger.warn(`未知的异常类型: ${type}，将使用默认值`);
      this.abnormalType = 'energy_anomaly';
    }
    
    return this;
  }
  
  /**
   * 从原始数据批量创建行驶数据模型
   * @param {Array} dataArray 原始数据数组
   * @returns {Object} 包含有效和无效模型的对象
   */
  static bulkCreate(dataArray) {
    if (!Array.isArray(dataArray)) {
      throw new Error('输入必须是数组');
    }
    
    const validModels = [];
    const invalidModels = [];
    
    for (const data of dataArray) {
      const model = new DrivingModel(data);
      const validation = model.validate();
      
      if (validation.valid) {
        validModels.push(model);
      } else {
        invalidModels.push({
          data,
          errors: validation.errors
        });
      }
    }
    
    return {
      valid: validModels,
      invalid: invalidModels,
      validCount: validModels.length,
      invalidCount: invalidModels.length,
      totalCount: dataArray.length
    };
  }
  
  /**
   * 检测异常
   * 基于规则检测行驶数据中的异常
   * @param {Object} referenceData 参考数据，如平均能耗、正常速度范围等
   * @returns {Object} 异常检测结果
   */
  detectAnomalies(referenceData = {}) {
    const anomalies = [];
    
    // 检测能耗异常
    if (referenceData.avgEnergyConsumption) {
      const avgEnergy = referenceData.avgEnergyConsumption;
      const threshold = referenceData.energyThreshold || 2.0; // 默认阈值为平均值的2倍
      
      if (this.energyConsumption > avgEnergy * threshold) {
        anomalies.push({
          type: 'energy_anomaly',
          message: `能耗异常高: ${this.energyConsumption} kWh，超过平均值 ${avgEnergy} kWh 的 ${threshold} 倍`,
          severity: 'high'
        });
      }
    }
    
    // 检测速度异常
    if (referenceData.maxSpeed) {
      const maxSpeed = referenceData.maxSpeed;
      
      if (this.speed > maxSpeed * 1.5) {
        anomalies.push({
          type: 'speed_anomaly',
          message: `速度异常高: ${this.speed} km/h，超过最大正常速度 ${maxSpeed} km/h 的 1.5 倍`,
          severity: 'high'
        });
      }
    }
    
    // 检测位置异常(位置跳变)
    if (referenceData.lastPosition) {
      const [lastLng, lastLat] = referenceData.lastPosition;
      const [currLng, currLat] = this.position;
      
      // 计算两点之间的距离 (简化版哈弗辛公式)
      const R = 6371; // 地球半径，单位km
      const dLat = (currLat - lastLat) * Math.PI / 180;
      const dLng = (currLng - lastLng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lastLat * Math.PI / 180) * Math.cos(currLat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      // 如果时间间隔和位置距离不合理，检测为位置异常
      if (referenceData.lastTimestamp) {
        const lastTime = new Date(referenceData.lastTimestamp).getTime();
        const currTime = new Date(this.timestamp).getTime();
        const timeGap = (currTime - lastTime) / 1000 / 3600; // 小时
        
        // 如果计算出的速度超过正常汽车能达到的速度，则为异常
        const speed = distance / timeGap; // km/h
        
        if (speed > 300) { // 假设300km/h为合理的最大速度
          anomalies.push({
            type: 'position_anomaly',
            message: `位置异常: 在 ${timeGap.toFixed(2)} 小时内移动了 ${distance.toFixed(2)} km，计算速度为 ${speed.toFixed(2)} km/h`,
            severity: 'medium',
            distance,
            timeGap,
            speed
          });
        }
      }
    }
    
    return {
      hasAnomalies: anomalies.length > 0,
      anomalies
    };
  }
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
function generateId() {
  return 'dr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

module.exports = DrivingModel;