// tools/data-generator/models/carbonModel.js
const logger = require('../utils/logger');
const { VIN_REGEX } = require('./vehicleModel');

/**
 * 碳减排数据模型定义和验证
 */
class CarbonModel {
  /**
   * 从行驶数据生成碳减排数据
   * @param {Array} drivingRecords 行驶记录数组
   * @param {Object} params 计算参数
   * @returns {Array} 碳减排数据数组
   */
  static generateFromDrivingData(drivingRecords, params = {}) {
    if (!Array.isArray(drivingRecords)) {
      throw new Error('行驶记录必须是数组');
    }
    
    const carbonRecords = [];
    const dailyData = {}; // 按日期和VIN码分组
    
    // 按日期和VIN分组累计里程和能耗
    for (const record of drivingRecords) {
      if (record.isAbnormal) continue; // 跳过异常数据
      
      const date = new Date(record.timestamp).toISOString().split('T')[0];
      const key = `${date}_${record.vin}`;
      
      if (!dailyData[key]) {
        dailyData[key] = {
          vin: record.vin,
          date: date,
          mileage: 0,
          energyConsumption: 0
        };
      }
      
      dailyData[key].mileage += record.mileage;
      dailyData[key].energyConsumption += record.energyConsumption;
    }
    
    // 为每个分组创建碳减排记录
    for (const key in dailyData) {
      const data = dailyData[key];
      
      // 创建碳减排记录
      const carbonRecord = new CarbonModel({
        vin: data.vin,
        calculationDate: data.date,
        mileage: Math.round(data.mileage * 100) / 100, // 四舍五入到2位小数
        energyConsumption: Math.round(data.energyConsumption * 100) / 100, // 四舍五入到2位小数
        calculationMethod: params.calculationMethod || 'standard-v1',
        calculationTimestamp: new Date().toISOString()
      });
      
      // 计算碳减排量
      carbonRecord.calculateReduction({
        gridEmissionFactor: params.gridEmissionFactor,
        traditionalVehicleEmission: params.traditionalVehicleEmission
      });
      
      // 计算等效燃油
      carbonRecord.calculateEquivalentFuel(params.fuelEmissionFactor);
      
      // 计算碳积分
      carbonRecord.calculateCredits(params.creditsConversionRate);
      
      // 随机设置验证状态
      if (params.verifiedRate !== undefined) {
        const rand = Math.random() * 100;
        if (rand < params.verifiedRate) {
          carbonRecord.setVerificationStatus('verified', generateTxHash());
        } else if (rand < params.verifiedRate + params.rejectedRate) {
          carbonRecord.setVerificationStatus('rejected');
        } else {
          carbonRecord.setVerificationStatus('pending');
        }
      }
      
      carbonRecords.push(carbonRecord);
    }
    
    return carbonRecords;
  }
  
  /**
   * 生成碳减排汇总数据
   * @param {Array} carbonRecords 碳减排记录数组
   * @returns {Object} 汇总数据
   */
  static summarize(carbonRecords) {
    if (!Array.isArray(carbonRecords)) {
      throw new Error('碳减排记录必须是数组');
    }
    
    // 总减排量和积分
    let totalReduction = 0;
    let totalCredits = 0;
    let totalFuel = 0;
    
    // 按车辆VIN码分组统计
    const vehicleStats = {};
    
    for (const record of carbonRecords) {
      // 只统计已验证的记录
      if (record.verificationStatus === 'verified') {
        totalReduction += record.carbonReduction;
        totalCredits += record.carbonCredits;
        totalFuel += record.equivalentFuel;
        
        // 按车辆统计
        if (!vehicleStats[record.vin]) {
          vehicleStats[record.vin] = {
            totalReduction: 0,
            totalCredits: 0,
            recordCount: 0
          };
        }
        
        vehicleStats[record.vin].totalReduction += record.carbonReduction;
        vehicleStats[record.vin].totalCredits += record.carbonCredits;
        vehicleStats[record.vin].recordCount += 1;
      }
    }
    
    // 计算等效种树数量 (1棵树约每年吸收20kg CO2)
    const equivalentTrees = Math.ceil(totalReduction / 20);
    
    // 四舍五入结果
    return {
      totalReduction: Math.round(totalReduction * 10) / 10,
      totalCredits: Math.round(totalCredits * 10) / 10,
      totalFuel: Math.round(totalFuel * 10) / 10,
      equivalentTrees,
      vehicleStats
    };
  }
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
function generateId() {
  return 'cr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * 生成随机交易哈希
 * @returns {string} 随机交易哈希
 */
function generateTxHash() {
  return '0x' + Array.from({length: 64}, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

module.exports = CarbonModel;
   * 验证状态选项
   */
  static VERIFICATION_STATUSES = ['verified', 'pending', 'rejected'];
  
  /**
   * 计算方法选项
   */
  static CALCULATION_METHODS = ['standard-v1', 'enhanced-v1', 'custom'];
  
  /**
   * 创建碳减排数据模型实例
   * @param {Object} data 碳减排数据
   */
  constructor(data = {}) {
    this.id = data.id || generateId();
    this.vin = data.vin || '';
    this.calculationDate = data.calculationDate || new Date().toISOString().split('T')[0];
    this.mileage = data.mileage || 0;
    this.energyConsumption = data.energyConsumption || 0;
    this.carbonReduction = data.carbonReduction || 0;
    this.equivalentFuel = data.equivalentFuel || 0;
    this.carbonCredits = data.carbonCredits || 0;
    this.calculationMethod = data.calculationMethod || 'standard-v1';
    this.verificationStatus = data.verificationStatus || 'pending';
    this.blockchainTxHash = data.blockchainTxHash || null;
    this.timestamp = data.timestamp || data.calculationTimestamp || new Date().toISOString();
    this.calculationTimestamp = data.calculationTimestamp || data.timestamp || new Date().toISOString();
    this.createdAt = data.createdAt || new Date().toISOString();
  }
  
  /**
   * 验证碳减排数据
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
    
    // 验证计算日期
    if (!this.calculationDate) {
      errors.push({ field: 'calculationDate', message: '计算日期不能为空' });
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(this.calculationDate)) {
        errors.push({ field: 'calculationDate', message: '计算日期格式不正确，应为YYYY-MM-DD' });
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
    
    // 验证碳减排量
    if (this.carbonReduction < 0) {
      errors.push({ field: 'carbonReduction', message: '碳减排量不能为负数' });
    }
    
    // 验证等效燃油
    if (this.equivalentFuel < 0) {
      errors.push({ field: 'equivalentFuel', message: '等效燃油不能为负数' });
    }
    
    // 验证碳积分
    if (this.carbonCredits < 0) {
      errors.push({ field: 'carbonCredits', message: '碳积分不能为负数' });
    }
    
    // 验证计算方法
    if (!CarbonModel.CALCULATION_METHODS.includes(this.calculationMethod)) {
      errors.push({ 
        field: 'calculationMethod', 
        message: `计算方法无效，应为 ${CarbonModel.CALCULATION_METHODS.join(', ')} 其中之一` 
      });
    }
    
    // 验证验证状态
    if (!CarbonModel.VERIFICATION_STATUSES.includes(this.verificationStatus)) {
      errors.push({ 
        field: 'verificationStatus', 
        message: `验证状态无效，应为 ${CarbonModel.VERIFICATION_STATUSES.join(', ')} 其中之一` 
      });
    }
    
    // 验证区块链交易哈希
    if (this.blockchainTxHash && this.verificationStatus === 'verified') {
      const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
      if (!txHashRegex.test(this.blockchainTxHash)) {
        errors.push({ field: 'blockchainTxHash', message: '区块链交易哈希格式不正确，应为0x开头的64位16进制字符' });
      }
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
      calculationDate: this.calculationDate,
      mileage: this.mileage,
      energyConsumption: this.energyConsumption,
      carbonReduction: this.carbonReduction,
      equivalentFuel: this.equivalentFuel,
      carbonCredits: this.carbonCredits,
      calculationMethod: this.calculationMethod,
      verificationStatus: this.verificationStatus,
      blockchainTxHash: this.blockchainTxHash,
      timestamp: this.timestamp,
      calculationTimestamp: this.calculationTimestamp,
      createdAt: this.createdAt
    };
  }
  
  /**
   * 计算碳减排量
   * 基于国家标准方法学计算电动车碳减排量
   * @param {Object} params 计算参数
   * @param {number} params.gridEmissionFactor 电网排放因子(kg CO2/kWh)
   * @param {number} params.traditionalVehicleEmission 传统车排放因子(kg CO2/km)
   * @returns {number} 碳减排量(kg)
   */
  calculateReduction(params = {}) {
    // 默认电网排放因子和传统车排放因子
    const gridEmissionFactor = params.gridEmissionFactor || 0.8547; // kg CO2/kWh
    const traditionalVehicleEmission = params.traditionalVehicleEmission || 0.196; // kg CO2/km
    
    // 电动车碳排放 = 能耗 * 电网排放因子
    const evEmission = this.energyConsumption * gridEmissionFactor;
    
    // 传统车碳排放 = 里程 * 传统车排放因子
    const traditionalEmission = this.mileage * traditionalVehicleEmission;
    
    // 碳减排量 = 传统车排放 - 电动车排放
    const carbonReduction = Math.max(0, traditionalEmission - evEmission);
    
    this.carbonReduction = Math.round(carbonReduction * 100) / 100; // 四舍五入到2位小数
    
    return this.carbonReduction;
  }
  
  /**
   * 计算碳积分
   * @param {number} conversionRate 碳积分转换率，每减排1kg CO2可获得的碳积分
   * @returns {number} 碳积分
   */
  calculateCredits(conversionRate = 0.05) {
    this.carbonCredits = Math.round(this.carbonReduction * conversionRate * 100) / 100; // 四舍五入到2位小数
    return this.carbonCredits;
  }
  
  /**
   * 计算等效燃油消耗
   * @param {number} fuelEmissionFactor 汽油排放系数(kg CO2/L)，默认2.3
   * @returns {number} 等效燃油消耗(L)
   */
  calculateEquivalentFuel(fuelEmissionFactor = 2.3) {
    this.equivalentFuel = Math.round(this.carbonReduction / fuelEmissionFactor * 100) / 100; // 四舍五入到2位小数
    return this.equivalentFuel;
  }
  
  /**
   * 设置验证状态
   * @param {string} status 验证状态
   * @param {string} txHash 区块链交易哈希(可选)
   * @returns {CarbonModel} 更新后的实例
   */
  setVerificationStatus(status, txHash = null) {
    if (!CarbonModel.VERIFICATION_STATUSES.includes(status)) {
      logger.warn(`无效的验证状态: ${status}，将保持原状态`);
      return this;
    }
    
    this.verificationStatus = status;
    
    if (status === 'verified' && txHash) {
      this.blockchainTxHash = txHash;
    }
    
    return this;
  }
  
  /**
   * 从原始数据批量创建碳减排数据模型
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
      const model = new CarbonModel(data);
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