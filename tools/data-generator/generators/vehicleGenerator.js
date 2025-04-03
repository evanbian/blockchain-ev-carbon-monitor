// tools/data-generator/generators/vehicleGenerator.js
const config = require('../config');
const randomUtils = require('../utils/randomUtils');
const dateUtils = require('../utils/dateUtils');
const fileUtils = require('../utils/fileUtils');
const logger = require('../utils/logger');
const path = require('path');

/**
 * 生成单个车辆数据
 * @returns {Object} 车辆数据
 */
function generateVehicle() {
  // 确定车型
  const model = randomUtils.getWeightedRandom(config.vehicle.models);
  
  // 获取对应制造商
  const manufacturer = config.vehicle.manufacturers[model];
  
  // 生成VIN码
  const vin = randomUtils.generateVIN();
  
  // 生成车牌号
  const licensePlate = randomUtils.generateLicensePlate();
  
  // 确定生产年份
  const productionYear = randomUtils.getRandomNumber(
    config.vehicle.productionYear.min,
    config.vehicle.productionYear.max
  );
  
  // 获取电池容量和最大续航
  const batteryCapacity = config.vehicle.batteryCapacity[model];
  const maxRange = config.vehicle.maxRange[model];
  
  // 确定状态
  const status = randomUtils.getWeightedRandom(config.vehicle.status);
  
  // 确定注册日期 (生产年份内的随机日期)
  const registerDate = dateUtils.getRandomDate(
    `${productionYear}-01-01`,
    `${productionYear}-12-31`
  ).format('YYYY-MM-DD');
  
  // 生成最后更新时间 (今天)
  const lastUpdateTime = new Date().toISOString();
  
  // 返回车辆数据
  return {
    vin,
    model,
    licensePlate,
    manufacturer,
    productionYear,
    batteryCapacity,
    maxRange,
    registerDate,
    status,
    lastUpdateTime,
    // 初始化累计数据为0
    totalMileage: 0,
    totalEnergy: 0,
    totalCarbonReduction: 0,
    carbonCredits: 0
  };
}

/**
 * 批量生成车辆数据
 * @param {number} count 生成数量，默认使用配置值
 * @returns {Array} 车辆数据数组
 */
async function generateVehicles(count = config.vehicle.count) {
  logger.info(`开始生成${count}辆车辆数据...`);
  
  const vehicles = [];
  // 记录已生成的VIN和车牌以避免重复
  const existingVINs = new Set();
  const existingPlates = new Set();
  
  for (let i = 0; i < count; i++) {
    let vehicle;
    let attempts = 0;
    const maxAttempts = 10; // 最大尝试次数，避免无限循环
    
    // 确保VIN和车牌唯一
    do {
      vehicle = generateVehicle();
      attempts++;
      
      if (attempts >= maxAttempts) {
        logger.warn(`无法生成唯一车辆数据，尝试次数: ${attempts}`);
        break;
      }
    } while (
      existingVINs.has(vehicle.vin) || 
      existingPlates.has(vehicle.licensePlate)
    );
    
    // 添加到集合和结果
    existingVINs.add(vehicle.vin);
    existingPlates.add(vehicle.licensePlate);
    vehicles.push(vehicle);
    
    logger.debug(`已生成车辆 ${i + 1}/${count}: ${vehicle.licensePlate} (${vehicle.model})`);
  }
  
  logger.info(`车辆数据生成完成，总数: ${vehicles.length}`);
  
  // 如果配置为输出到文件，则保存数据
  if (config.global.integration.target.includes('file')) {
    const outputPath = path.join(config.global.outputDir, 'vehicles.json');
    fileUtils.writeJsonFile(outputPath, vehicles);
    logger.info(`车辆数据已保存到: ${outputPath}`);
  }
  
  return vehicles;
}

/**
 * 更新车辆状态
 * @param {Array} vehicles 车辆数据数组
 * @returns {Array} 更新后的车辆数据数组
 */
function updateVehicleStatus(vehicles) {
  const updatedVehicles = [...vehicles];
  
  for (const vehicle of updatedVehicles) {
    // 10%的概率改变状态
    if (randomUtils.getRandomNumber(1, 100) <= 10) {
      vehicle.status = randomUtils.getWeightedRandom(config.vehicle.status);
      vehicle.lastUpdateTime = new Date().toISOString();
    }
  }
  
  return updatedVehicles;
}

/**
 * 根据行驶数据更新车辆累计指标
 * @param {Array} vehicles 车辆数据数组
 * @param {Array} drivingRecords 行驶记录数组
 * @returns {Array} 更新后的车辆数据数组
 */
function updateVehicleTotals(vehicles, drivingRecords) {
  const updatedVehicles = [...vehicles];
  const vehicleMap = new Map();
  
  // 创建车辆查找映射
  for (let i = 0; i < updatedVehicles.length; i++) {
    vehicleMap.set(updatedVehicles[i].vin, i);
  }
  
  // 按车辆VIN分组行驶记录
  const recordsByVin = drivingRecords.reduce((groups, record) => {
    if (!groups[record.vin]) {
      groups[record.vin] = [];
    }
    groups[record.vin].push(record);
    return groups;
  }, {});
  
  // 更新每辆车的累计指标
  for (const [vin, records] of Object.entries(recordsByVin)) {
    const vehicleIndex = vehicleMap.get(vin);
    if (vehicleIndex !== undefined) {
      const vehicle = updatedVehicles[vehicleIndex];
      
      // 计算总里程
      const totalMileage = records.reduce((sum, record) => sum + record.mileage, 0);
      vehicle.totalMileage = Math.round((vehicle.totalMileage + totalMileage) * 10) / 10;
      
      // 计算总能耗
      const totalEnergy = records.reduce((sum, record) => sum + record.energyConsumption, 0);
      vehicle.totalEnergy = Math.round((vehicle.totalEnergy + totalEnergy) * 10) / 10;
      
      // 最后更新时间
      const recordTimes = records.map(record => new Date(record.timestamp));
      if (recordTimes.length > 0) {
        const latestTime = new Date(Math.max(...recordTimes));
        vehicle.lastUpdateTime = latestTime.toISOString();
      }
    }
  }
  
  return updatedVehicles;
}

/**
 * 模拟当前活跃车辆状态
 * @param {Array} vehicles 车辆数据数组
 * @returns {Array} 活跃车辆数据，包含当前位置、速度等
 */
function simulateActiveVehicles(vehicles) {
  // 深圳市中心坐标
  const SHENZHEN_CENTER = [114.0579, 22.5431];
  
  const activeVehicles = vehicles.map(vehicle => {
    // 生成随机位置（深圳市内）
    const position = randomUtils.generateGeoCoordinates({
      center: SHENZHEN_CENTER,
      radius: 20 // 20公里范围内
    });
    
    // 生成随机速度（根据状态）
    let speed = 0;
    if (vehicle.status === 'online') {
      // 在线状态有70%概率正在行驶
      if (randomUtils.getRandomNumber(1, 100) <= 70) {
        speed = randomUtils.getRandomNumber(5, 100); // 5-100 km/h
      }
    }
    
    // 生成随机电量（10%-100%）
    const batteryLevel = randomUtils.getRandomNumber(10, 100);
    
    // 返回活跃状态数据
    return {
      vin: vehicle.vin,
      licensePlate: vehicle.licensePlate,
      model: vehicle.model,
      status: vehicle.status,
      speed,
      position,
      batteryLevel,
      lastUpdateTime: new Date().toISOString()
    };
  });
  
  return activeVehicles;
}

/**
 * 从文件加载车辆数据
 * @returns {Array} 车辆数据数组
 */
function loadVehicles() {
  const filePath = path.join(config.global.outputDir, 'vehicles.json');
  if (fileUtils.readJsonFile(filePath)) {
    return fileUtils.readJsonFile(filePath);
  }
  
  logger.warn(`车辆数据文件不存在: ${filePath}，将生成新数据`);
  return generateVehicles();
}

// 如果直接运行此文件，则生成车辆数据
if (require.main === module) {
  generateVehicles()
    .then(() => logger.info('车辆数据生成完成'))
    .catch(err => logger.error('车辆数据生成失败', err));
}

module.exports = {
  generateVehicle,
  generateVehicles,
  updateVehicleStatus,
  updateVehicleTotals,
  simulateActiveVehicles,
  loadVehicles
};