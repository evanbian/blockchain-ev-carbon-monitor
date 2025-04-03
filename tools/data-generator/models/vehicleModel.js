// tools/data-generator/models/vehicleModel.js
const logger = require('../utils/logger');

/**
 * 车辆数据模型定义和验证
 */
class VehicleModel {
  /**
   * VIN码正则表达式
   * 符合标准17位VIN码格式
   */
  static VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;
  
  /**
   * 车牌号正则表达式
   * 符合中国车牌格式
   */
  static LICENSE_PLATE_REGEX = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{5}$/;
  
  /**
   * 可选状态值
   */
  static VALID_STATUSES = ['online', 'offline', 'error'];
  
  /**
   * 创建车辆模型实例
   * @param {Object} data 车辆数据
   */
  constructor(data = {}) {
    this.vin = data.vin || '';
    this.model = data.model || '';
    this.licensePlate = data.licensePlate || '';
    this.manufacturer = data.manufacturer || '';
    this.productionYear = data.productionYear || new Date().getFullYear();
    this.batteryCapacity = data.batteryCapacity || 0;
    this.maxRange = data.maxRange || 0;
    this.registerDate = data.registerDate || new Date().toISOString().split('T')[0];
    this.status = data.status || 'offline';
    this.lastUpdateTime = data.lastUpdateTime || new Date().toISOString();
    this.totalMileage = data.totalMileage || 0;
    this.totalEnergy = data.totalEnergy || 0;
    this.totalCarbonReduction = data.totalCarbonReduction || 0;
    this.carbonCredits = data.carbonCredits || 0;
  }
  
  /**
   * 验证车辆数据
   * @returns {Object} 验证结果，包含是否通过和错误信息
   */
  validate() {
    const errors = [];
    
    // 验证VIN码
    if (!this.vin) {
      errors.push({ field: 'vin', message: 'VIN码不能为空' });
    } else if (!VehicleModel.VIN_REGEX.test(this.vin)) {
      errors.push({ field: 'vin', message: 'VIN码格式不正确，应为17位字母数字组合(不包含I,O,Q)' });
    }
    
    // 验证车型
    if (!this.model) {
      errors.push({ field: 'model', message: '车型不能为空' });
    }
    
    // 验证车牌号
    if (this.licensePlate && !VehicleModel.LICENSE_PLATE_REGEX.test(this.licensePlate)) {
      errors.push({ field: 'licensePlate', message: '车牌号格式不正确' });
    }
    
    // 验证生产年份
    const currentYear = new Date().getFullYear();
    if (this.productionYear < 1990 || this.productionYear > currentYear) {
      errors.push({ field: 'productionYear', message: `生产年份应在1990-${currentYear}之间` });
    }
    
    // 验证电池容量
    if (this.batteryCapacity <= 0) {
      errors.push({ field: 'batteryCapacity', message: '电池容量必须大于0' });
    }
    
    // 验证最大续航里程
    if (this.maxRange <= 0) {
      errors.push({ field: 'maxRange', message: '最大续航里程必须大于0' });
    }
    
    // 验证状态
    if (!VehicleModel.VALID_STATUSES.includes(this.status)) {
      errors.push({ 
        field: 'status', 
        message: `状态值无效，应为 ${VehicleModel.VALID_STATUSES.join(', ')} 其中之一` 
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
      vin: this.vin,
      model: this.model,
      licensePlate: this.licensePlate,
      manufacturer: this.manufacturer,
      productionYear: this.productionYear,
      batteryCapacity: this.batteryCapacity,
      maxRange: this.maxRange,
      registerDate: this.registerDate,
      status: this.status,
      lastUpdateTime: this.lastUpdateTime,
      totalMileage: this.totalMileage,
      totalEnergy: this.totalEnergy,
      totalCarbonReduction: this.totalCarbonReduction,
      carbonCredits: this.carbonCredits
    };
  }
  
  /**
   * 更新车辆数据
   * @param {Object} data 更新的数据
   * @returns {VehicleModel} 更新后的实例
   */
  update(data) {
    if (data.model) this.model = data.model;
    if (data.licensePlate) this.licensePlate = data.licensePlate;
    if (data.manufacturer) this.manufacturer = data.manufacturer;
    if (data.productionYear) this.productionYear = data.productionYear;
    if (data.batteryCapacity) this.batteryCapacity = data.batteryCapacity;
    if (data.maxRange) this.maxRange = data.maxRange;
    if (data.status) this.status = data.status;
    if (data.totalMileage) this.totalMileage = data.totalMileage;
    if (data.totalEnergy) this.totalEnergy = data.totalEnergy;
    if (data.totalCarbonReduction) this.totalCarbonReduction = data.totalCarbonReduction;
    if (data.carbonCredits) this.carbonCredits = data.carbonCredits;
    
    this.lastUpdateTime = new Date().toISOString();
    
    return this;
  }
  
  /**
   * 从原始数据批量创建车辆模型
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
      const model = new VehicleModel(data);
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
   * 计算车辆能源效率
   * @returns {number} 能源效率 (km/kWh)
   */
  calculateEnergyEfficiency() {
    if (this.totalEnergy === 0) return 0;
    return this.totalMileage / this.totalEnergy;
  }
  
  /**
   * 计算碳减排效率
   * @returns {number} 碳减排效率 (kg/km)
   */
  calculateCarbonEfficiency() {
    if (this.totalMileage === 0) return 0;
    return this.totalCarbonReduction / this.totalMileage;
  }
}