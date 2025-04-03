// tools/data-generator/generators/drivingGenerator.js
const config = require('../config');
const randomUtils = require('../utils/randomUtils');
const dateUtils = require('../utils/dateUtils');
const fileUtils = require('../utils/fileUtils');
const logger = require('../utils/logger');
const path = require('path');
const moment = require('moment');

/**
 * 为特定车辆生成驾驶模式
 * @param {string} vin 车辆VIN码
 * @returns {string} 驾驶模式(commute/leisure/long-distance)
 */
function generateDrivingPattern(vin) {
  // 基于VIN散列值来为每辆车分配相对固定的驾驶模式
  const hash = vin.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const patterns = Object.keys(config.driving.dailyMileage.patterns);
  const weights = Object.values(config.driving.dailyMileage.patterns);
  
  // 使用VIN散列值作为随机种子，确保同一辆车有相对稳定的驾驶模式
  const seed = `${hash}-pattern`;
  randomUtils.resetRng(seed);
  
  const pattern = randomUtils.getWeightedRandom(
    patterns.reduce((obj, pattern, i) => {
      obj[pattern] = weights[i];
      return obj;
    }, {})
  );
  
  // 重置回全局随机种子
  randomUtils.resetRng();
  
  return pattern;
}

/**
 * 为特定日期和车辆生成行驶里程
 * @param {string} vin 车辆VIN码
 * @param {moment.Moment} date 日期
 * @returns {number} 行驶里程(km)
 */
function generateDailyMileage(vin, date) {
  const pattern = generateDrivingPattern(vin);
  const isWeekend = !dateUtils.isWorkday(date);
  
  // 基础里程范围
  let minMileage = config.driving.dailyMileage.min;
  let maxMileage = config.driving.dailyMileage.max;
  
  // 根据模式调整里程范围
  switch (pattern) {
    case 'commute':
      // 通勤模式：工作日里程较固定，周末较少
      if (!isWeekend) {
        minMileage = 20;
        maxMileage = 60;
      } else {
        minMileage = 0;
        maxMileage = 40;
      }
      break;
      
    case 'leisure':
      // 休闲模式：周末里程较多，工作日较少
      if (isWeekend) {
        minMileage = 30;
        maxMileage = 100;
      } else {
        minMileage = 5;
        maxMileage = 30;
      }
      break;
      
    case 'long-distance':
      // 长途模式：偶尔有长途行驶
      if (randomUtils.getRandomNumber(1, 100) <= 15) { // 15%概率长途行驶
        minMileage = 100;
        maxMileage = 500;
      }
      break;
  }
  
  // 季节影响
  const season = dateUtils.getSeason(date);
  let seasonalFactor = 1.0;
  
  switch (season) {
    case 'winter':
      seasonalFactor = 0.9; // 冬季行驶总体减少
      break;
    case 'summer':
      if (pattern === 'leisure') {
        seasonalFactor = 1.2; // 夏季休闲出行增加
      }
      break;
  }
  
  // 生成里程
  const mileage = randomUtils.getRandomNumber(
    minMileage * seasonalFactor, 
    maxMileage * seasonalFactor, 
    false
  );
  
  // 四舍五入到一位小数
  return Math.round(mileage * 10) / 10;
}

/**
 * 计算能耗
 * @param {Object} options 计算选项
 * @param {string} options.model 车型
 * @param {number} options.mileage 行驶里程(km)
 * @param {string} options.pattern 驾驶模式
 * @param {moment.Moment} options.date 日期
 * @returns {number} 能耗(kWh)
 */
function calculateEnergyConsumption(options) {
  const { model, mileage, pattern, date } = options;
  
  // 基础能耗系数(kWh/100km)
  const baseConsumption = config.driving.energyConsumption.base[model] || 15.0;
  
  // 季节调整
  const season = dateUtils.getSeason(date);
  const seasonFactor = config.driving.energyConsumption.seasonAdjustment[season] || 1.0;
  
  // 驾驶模式调整
  const patternFactor = config.driving.energyConsumption.patternAdjustment[pattern] || 1.0;
  
  // 是否高峰时段
  const isPeak = dateUtils.isPeakHour(date);
  const peakFactor = isPeak ? 1.1 : 1.0; // 高峰时段能耗增加10%
  
  // 随机波动（±10%）
  const randomFactor = 0.9 + randomUtils.getRandomNumber(0, 200, false) / 1000;
  
  // 计算能耗
  const consumption = baseConsumption * seasonFactor * patternFactor * peakFactor * randomFactor;
  
  // 计算总能耗(kWh)
  const totalConsumption = consumption * mileage / 100;
  
  // 四舍五入到两位小数
  return Math.round(totalConsumption * 100) / 100;
}

/**
 * 生成单次行驶记录
 * @param {Object} vehicle 车辆数据
 * @param {moment.Moment} timestamp 时间戳
 * @returns {Object} 行驶记录
 */
function generateDrivingRecord(vehicle, timestamp) {
  const { vin, model } = vehicle;
  
  // 获取驾驶模式
  const pattern = generateDrivingPattern(vin);
  
  // 生成里程
  const mileage = generateDailyMileage(vin, timestamp);
  
  // 计算能耗
  const energyConsumption = calculateEnergyConsumption({
    model,
    mileage,
    pattern,
    date: timestamp
  });
  
  // 生成位置（深圳市内）
  const position = randomUtils.generateGeoCoordinates({
    center: [114.0579, 22.5431], // 深圳中心坐标
    radius: 20
  });
  
  // 生成速度（0-120 km/h）
  const speed = mileage > 0 ? randomUtils.getRandomNumber(0, 120) : 0;
  
  // 生成电池电量（10%-100%）
  const batteryLevel = randomUtils.getRandomNumber(10, 100);
  
  // 生成异常状态
  const isAbnormal = randomUtils.isAnomaly();
  
  // 异常数据处理
  let abnormalData = {};
  if (isAbnormal) {
    // 异常类型：1-能耗异常，2-位置异常，3-速度异常
    const abnormalType = randomUtils.getRandomNumber(1, 3);
    
    switch (abnormalType) {
      case 1: // 能耗异常（超高）
        abnormalData = {
          energyConsumption: energyConsumption * randomUtils.getRandomNumber(150, 300, false) / 100,
          abnormalType: 'energy_anomaly'
        };
        break;
      case 2: // 位置异常（大跳跃）
        abnormalData = {
          position: randomUtils.generateGeoCoordinates(), // 任意位置
          abnormalType: 'position_anomaly'
        };
        break;
      case 3: // 速度异常（超高）
        abnormalData = {
          speed: randomUtils.getRandomNumber(150, 300),
          abnormalType: 'speed_anomaly'
        };
        break;
    }
  }
  
  // 创建记录对象
  return {
    id: randomUtils.generateUUID(),
    vin,
    timestamp: timestamp.toISOString(),
    mileage,
    energyConsumption: abnormalData.energyConsumption || energyConsumption,
    speed: abnormalData.speed || speed,
    batteryLevel,
    position: abnormalData.position || position,
    isAbnormal,
    ...(isAbnormal ? { abnormalType: abnormalData.abnormalType } : {})
  };
}

/**
 * 生成全部车辆的行驶数据
 * @param {Array} vehicles 车辆数据数组
 * @returns {Array} 行驶记录数组
 */
async function generateDrivingData(vehicles) {
  logger.info('开始生成行驶数据...');
  
  // 获取时间范围
  const { start, end } = dateUtils.getTimeRange();
  
  // 生成时间序列（每天记录次数随机1-3次）
  const timeSeriesPromises = vehicles.map(vehicle => {
    return new Promise(resolve => {
      const records = [];
      let currentDate = start.clone();
      
      // 遍历每一天
      while (currentDate.isSameOrBefore(end)) {
        // 只有在线状态的车辆会有行驶数据
        if (vehicle.status === 'online' || randomUtils.getRandomNumber(1, 100) <= 20) { // 20%概率离线车辆也有数据
          // 当天记录次数（1-3次）
          const recordCount = randomUtils.getRandomNumber(1, 3);
          
          for (let i = 0; i < recordCount; i++) {
            // 生成记录时间点（为当天添加随机时间）
            const recordTime = currentDate.clone()
              .hour(randomUtils.getRandomNumber(7, 22)) // 7点到22点
              .minute(randomUtils.getRandomNumber(0, 59))
              .second(randomUtils.getRandomNumber(0, 59));
            
            // 生成行驶记录
            const record = generateDrivingRecord(vehicle, recordTime);
            records.push(record);
          }
        }
        
        // 下一天
        currentDate.add(1, 'days');
      }
      
      resolve(records);
    });
  });
  
  // 并行生成所有车辆数据
  const allRecordsArrays = await Promise.all(timeSeriesPromises);
  
  // 合并所有记录
  const allRecords = allRecordsArrays.flat();
  
  // 按时间排序
  allRecords.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  logger.info(`行驶数据生成完成，共${allRecords.length}条记录`);
  
  // 如果配置为输出到文件，则保存数据
  if (config.global.integration.target.includes('file')) {
    const outputPath = path.join(config.global.outputDir, 'driving-data.json');
    fileUtils.writeJsonFile(outputPath, allRecords);
    logger.info(`行驶数据已保存到: ${outputPath}`);
  }
  
  return allRecords;
}

/**
 * 生成实时行驶数据（用于流式模式）
 * @param {Array} vehicles 车辆数据数组
 * @returns {Array} 实时行驶记录数组
 */
async function generateRealtimeDrivingData(vehicles) {
  logger.info('生成实时行驶数据...');
  
  const now = moment();
  const records = [];
  
  // 筛选在线车辆
  const onlineVehicles = vehicles.filter(v => v.status === 'online');
  
  // 随机选择部分车辆生成数据（60%-80%）
  const activeVehicleCount = Math.round(onlineVehicles.length * (0.6 + Math.random() * 0.2));
  const activeVehicles = onlineVehicles
    .sort(() => Math.random() - 0.5)
    .slice(0, activeVehicleCount);
  
  // 为每辆活跃车辆生成记录
  for (const vehicle of activeVehicles) {
    // 生成记录时间（当前时间前后15分钟内）
    const recordTime = now.clone()
      .subtract(randomUtils.getRandomNumber(0, 15), 'minutes')
      .add(randomUtils.getRandomNumber(0, 15), 'seconds');
    
    // 生成行驶记录
    const record = generateDrivingRecord(vehicle, recordTime);
    records.push(record);
  }
  
  // 按时间排序
  records.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  logger.info(`实时行驶数据生成完成，共${records.length}条记录`);
  
  return records;
}

/**
 * 从文件加载行驶数据
 * @returns {Array} 行驶记录数组
 */
function loadDrivingData() {
  const filePath = path.join(config.global.outputDir, 'driving-data.json');
  if (fileUtils.readJsonFile(filePath)) {
    return fileUtils.readJsonFile(filePath);
  }
  
  logger.warn(`行驶数据文件不存在: ${filePath}`);
  return [];
}

// 如果直接运行此文件，则生成行驶数据
if (require.main === module) {
  const vehicleGenerator = require('./vehicleGenerator');
  
  vehicleGenerator.loadVehicles()
    .then(vehicles => generateDrivingData(vehicles))
    .then(() => logger.info('行驶数据生成完成'))
    .catch(err => logger.error('行驶数据生成失败', err));
}

module.exports = {
  generateDrivingPattern,
  generateDailyMileage,
  calculateEnergyConsumption,
  generateDrivingRecord,
  generateDrivingData,
  generateRealtimeDrivingData,
  loadDrivingData
};