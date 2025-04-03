// tools/data-generator/generators/carbonGenerator.js
const config = require('../config');
const randomUtils = require('../utils/randomUtils');
const dateUtils = require('../utils/dateUtils');
const fileUtils = require('../utils/fileUtils');
const logger = require('../utils/logger');
const path = require('path');
const moment = require('moment');

/**
 * 计算碳减排量
 * @param {number} mileage 行驶里程(km)
 * @param {number} energyConsumption 能耗(kWh)
 * @returns {number} 碳减排量(kg)
 */
function calculateCarbonReduction(mileage, energyConsumption) {
  // 电网排放因子(kg CO2/kWh)
  const gridEmissionFactor = config.carbon.gridEmissionFactor;
  
  // 传统燃油车排放因子(kg CO2/km)
  const traditionalVehicleEmission = config.carbon.traditionalVehicleEmission;
  
  // 电动车碳排放 = 能耗 * 电网排放因子
  const evEmission = energyConsumption * gridEmissionFactor;
  
  // 传统车碳排放 = 里程 * 传统车排放因子
  const traditionalEmission = mileage * traditionalVehicleEmission;
  
  // 碳减排量 = 传统车排放 - 电动车排放
  const carbonReduction = traditionalEmission - evEmission;
  
  // 如果减排为负（电网排放因子很高的情况），返回0
  return Math.max(0, carbonReduction);
}

/**
 * 计算碳积分
 * @param {number} carbonReduction 碳减排量(kg)
 * @returns {number} 碳积分
 */
function calculateCarbonCredits(carbonReduction) {
  // 碳积分转换系数
  const conversionRate = config.carbon.creditsConversionRate;
  
  // 计算积分
  const credits = carbonReduction * conversionRate;
  
  // 四舍五入到两位小数
  return Math.round(credits * 100) / 100;
}

/**
 * 计算等效燃油消耗
 * @param {number} carbonReduction 碳减排量(kg)
 * @returns {number} 等效燃油消耗(L)
 */
function calculateEquivalentFuel(carbonReduction) {
  // 燃油CO2排放系数(kg CO2/L) - 汽油约为2.3 kg CO2/L
  const fuelEmissionFactor = 2.3;
  
  // 计算等效燃油量 = 碳减排量 / 燃油排放系数
  const fuel = carbonReduction / fuelEmissionFactor;
  
  // 四舍五入到两位小数
  return Math.round(fuel * 100) / 100;
}

/**
 * 生成单条碳减排记录
 * @param {Object} drivingRecord 行驶记录
 * @returns {Object} 碳减排记录
 */
function generateCarbonRecord(drivingRecord) {
  const { vin, timestamp, mileage, energyConsumption } = drivingRecord;
  
  // 计算碳减排量
  const carbonReduction = calculateCarbonReduction(mileage, energyConsumption);
  
  // 计算碳积分
  const carbonCredits = calculateCarbonCredits(carbonReduction);
  
  // 计算等效燃油消耗
  const equivalentFuel = calculateEquivalentFuel(carbonReduction);
  
  // 生成计算日期（取驾驶记录的日期部分）
  const calculationDate = moment(timestamp).format('YYYY-MM-DD');
  
  // 生成计算方法
  const calculationMethod = 'standard-v1';
  
  // 生成验证状态
  const verificationStatus = randomUtils.getWeightedRandom({
    'verified': 90,
    'pending': 8,
    'rejected': 2
  });
  
  // 生成区块链交易哈希(如果已验证)
  const blockchainTxHash = verificationStatus === 'verified' 
    ? `0x${randomUtils.getRandomNumber(100000, 999999).toString(16)}${randomUtils.getRandomNumber(1000000, 9999999).toString(16)}`
    : null;
  
  // 返回碳减排记录
  return {
    id: randomUtils.generateUUID(),
    vin,
    timestamp,
    calculationDate,
    mileage,
    energyConsumption,
    carbonReduction: Math.round(carbonReduction * 100) / 100, // 四舍五入到两位小数
    carbonCredits,
    equivalentFuel,
    calculationMethod,
    verificationStatus,
    blockchainTxHash,
    calculationTimestamp: new Date().toISOString()
  };
}

/**
 * 汇总碳减排记录
 * @param {Array} carbonRecords 碳减排记录数组
 * @returns {Object} 汇总信息
 */
function summarizeCarbonData(carbonRecords) {
  // 计算总减排量和总积分
  const totalReduction = carbonRecords.reduce((sum, record) => sum + record.carbonReduction, 0);
  const totalCredits = carbonRecords.reduce((sum, record) => sum + record.carbonCredits, 0);
  
  // 计算总等效燃油
  const totalFuel = carbonRecords.reduce((sum, record) => sum + record.equivalentFuel, 0);
  
  // 计算等效种树数量 (1棵树约每年吸收20kg CO2)
  const equivalentTrees = Math.ceil(totalReduction / 20);
  
  // 按车辆VIN分组统计
  const vehicleStats = carbonRecords.reduce((stats, record) => {
    if (!stats[record.vin]) {
      stats[record.vin] = {
        totalReduction: 0,
        totalCredits: 0,
        recordCount: 0
      };
    }
    
    stats[record.vin].totalReduction += record.carbonReduction;
    stats[record.vin].totalCredits += record.carbonCredits;
    stats[record.vin].recordCount += 1;
    
    return stats;
  }, {});
  
  // 四舍五入结果
  return {
    totalReduction: Math.round(totalReduction * 10) / 10,
    totalCredits: Math.round(totalCredits * 10) / 10,
    totalFuel: Math.round(totalFuel * 10) / 10,
    equivalentTrees,
    vehicleStats
  };
}

/**
 * 生成碳减排数据
 * @param {Array} vehicles 车辆数据数组
 * @param {Array} drivingRecords 行驶记录数组
 * @returns {Object} 碳减排数据对象，包含records和summary
 */
async function generateCarbonData(vehicles, drivingRecords) {
  logger.info('开始生成碳减排数据...');
  
  const carbonRecords = [];
  
  // 为每条行驶记录生成碳减排记录
  for (const drivingRecord of drivingRecords) {
    // 跳过异常数据
    if (drivingRecord.isAbnormal) continue;
    
    // 生成碳减排记录
    const carbonRecord = generateCarbonRecord(drivingRecord);
    carbonRecords.push(carbonRecord);
  }
  
  // 按时间排序
  carbonRecords.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  // 汇总数据
  const summary = summarizeCarbonData(carbonRecords);
  
  logger.info(`碳减排数据生成完成，共${carbonRecords.length}条记录`);
  logger.info(`总减排量: ${summary.totalReduction} kg，总积分: ${summary.totalCredits}`);
  
  // 整合数据对象
  const carbonData = {
    records: carbonRecords,
    summary
  };
  
  // 如果配置为输出到文件，则保存数据
  if (config.global.integration.target.includes('file')) {
    const outputPath = path.join(config.global.outputDir, 'carbon-data.json');
    fileUtils.writeJsonFile(outputPath, carbonData);
    logger.info(`碳减排数据已保存到: ${outputPath}`);
  }
  
  return carbonData;
}

/**
 * 生成实时碳减排数据（用于流式模式）
 * @param {Array} vehicles 车辆数据数组
 * @param {Array} drivingRecords 实时行驶记录数组
 * @returns {Object} 实时碳减排数据对象
 */
async function generateRealtimeCarbonData(vehicles, drivingRecords) {
  logger.info('生成实时碳减排数据...');
  
  const carbonRecords = [];
  
  // 为每条行驶记录生成碳减排记录
  for (const drivingRecord of drivingRecords) {
    // 跳过异常数据
    if (drivingRecord.isAbnormal) continue;
    
    // 生成碳减排记录
    const carbonRecord = generateCarbonRecord(drivingRecord);
    carbonRecords.push(carbonRecord);
  }
  
  // 按时间排序
  carbonRecords.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  // 汇总数据
  const summary = summarizeCarbonData(carbonRecords);
  
  logger.info(`实时碳减排数据生成完成，共${carbonRecords.length}条记录`);
  
  // 整合数据对象
  return {
    records: carbonRecords,
    summary
  };
}

/**
 * 从文件加载碳减排数据
 * @returns {Object} 碳减排数据对象
 */
function loadCarbonData() {
  const filePath = path.join(config.global.outputDir, 'carbon-data.json');
  if (fileUtils.readJsonFile(filePath)) {
    return fileUtils.readJsonFile(filePath);
  }
  
  logger.warn(`碳减排数据文件不存在: ${filePath}`);
  return { records: [], summary: { totalReduction: 0, totalCredits: 0 } };
}

// 如果直接运行此文件，则生成碳减排数据
if (require.main === module) {
  const vehicleGenerator = require('./vehicleGenerator');
  const drivingGenerator = require('./drivingGenerator');
  
  Promise.all([
    vehicleGenerator.loadVehicles(),
    drivingGenerator.loadDrivingData()
  ])
    .then(([vehicles, drivingRecords]) => generateCarbonData(vehicles, drivingRecords))
    .then(() => logger.info('碳减排数据生成完成'))
    .catch(err => logger.error('碳减排数据生成失败', err));
}

module.exports = {
  calculateCarbonReduction,
  calculateCarbonCredits,
  calculateEquivalentFuel,
  generateCarbonRecord,
  summarizeCarbonData,
  generateCarbonData,
  generateRealtimeCarbonData,
  loadCarbonData
};