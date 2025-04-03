// tools/data-generator/utils/randomUtils.js
const seedrandom = require('seedrandom');
const config = require('../config');
const faker = require('faker');

// 初始化随机数生成器
let rng = seedrandom(config.global.seed);
faker.seed(parseInt(String(config.global.seed).split('').map(c => c.charCodeAt(0)).reduce((a, b) => a + b, 0)));

/**
 * 生成指定范围内的随机数
 * @param {number} min 最小值(包含)
 * @param {number} max 最大值(包含)
 * @param {boolean} isInt 是否为整数，默认true
 * @returns {number} 随机数
 */
function getRandomNumber(min, max, isInt = true) {
  const rand = rng() * (max - min) + min;
  return isInt ? Math.round(rand) : rand;
}

/**
 * 生成指定范围内的随机数（带小数）
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @param {number} decimalPlaces 小数位数
 * @returns {number} 随机小数
 */
function getRandomDecimal(min, max, decimalPlaces = 2) {
  const rand = rng() * (max - min) + min;
  const multiplier = Math.pow(10, decimalPlaces);
  return Math.round(rand * multiplier) / multiplier;
}

/**
 * 基于权重随机选择项目
 * @param {Object} weights 权重对象，键为项目名，值为权重
 * @returns {string} 选中的项目名
 */
function getWeightedRandom(weights) {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  
  let random = rng() * total;
  for (const [item, weight] of entries) {
    if ((random -= weight) < 0) {
      return item;
    }
  }
  // 防止浮点数精度问题导致的未命中，返回最后一项
  return entries[entries.length - 1][0];
}

/**
 * 从数组中随机选择一项
 * @param {Array} array 数组
 * @returns {*} 随机选中的项目
 */
function getRandomItem(array) {
  return array[Math.floor(rng() * array.length)];
}

/**
 * 生成随机的车牌号（中国格式）
 * @returns {string} 车牌号
 */
function generateLicensePlate() {
  const provinces = [
    '京', '津', '冀', '晋', '蒙', '辽', '吉', '黑', '沪', '苏',
    '浙', '皖', '闽', '赣', '鲁', '豫', '鄂', '湘', '粤', '桂',
    '琼', '渝', '川', '贵', '云', '藏', '陕', '甘', '青', '宁', '新'
  ];
  
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const province = getRandomItem(provinces);
  const letter = getRandomItem(letters.split(''));
  
  // 生成5位数字与字母组合
  let tail = '';
  const useLetters = ['0', '1']; // 使用数字或字母的选择
  
  for (let i = 0; i < 5; i++) {
    if (getRandomNumber(0, 10) > 7 && i > 0) {
      // 30%概率使用字母（第一位必须是数字）
      tail += getRandomItem(letters.split(''));
    } else {
      // 70%概率使用数字
      tail += getRandomNumber(0, 9).toString();
    }
  }
  
  return `${province}${letter}${tail}`;
}

/**
 * 生成随机的VIN码
 * @returns {string} VIN码
 */
function generateVIN() {
  // VIN码规则: 3位世界制造厂识别码 + 6位车辆描述 + 8位车辆识别码
  const manufacturers = ['LSV', 'LFV', 'LJD', 'LBV', 'WAU']; // 示例制造商代码
  const manufacturer = getRandomItem(manufacturers);
  
  // 车辆描述部分
  const descriptionChars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'; // 不包含I, O, Q
  let description = '';
  for (let i = 0; i < 6; i++) {
    description += getRandomItem(descriptionChars.split(''));
  }
  
  // 车辆识别码部分
  const yearCode = String.fromCharCode(74 + getRandomNumber(0, 3)); // J-M 代表 2018-2021
  let identifier = yearCode;
  for (let i = 0; i < 7; i++) {
    identifier += getRandomNumber(0, 9).toString();
  }
  
  return `${manufacturer}${description}${identifier}`;
}

/**
 * 重置随机数生成器
 * @param {string} seed 随机种子，不提供则使用配置中的种子
 */
function resetRng(seed) {
  seed = seed || config.global.seed;
  rng = seedrandom(seed);
  faker.seed(parseInt(String(seed).split('').map(c => c.charCodeAt(0)).reduce((a, b) => a + b, 0)));
}

/**
 * 生成全局唯一标识符
 * @returns {string} UUID
 */
function generateUUID() {
  return faker.datatype.uuid();
}

/**
 * 生成随机地理坐标（中国范围内）
 * @param {Object} options 选项
 * @param {Array} options.center 中心点坐标 [lng, lat]
 * @param {number} options.radius 半径（公里）
 * @returns {Array} [lng, lat] 坐标
 */
function generateGeoCoordinates(options = {}) {
  // 中国大陆范围
  const DEFAULT_BOUNDS = {
    minLng: 73.55,
    maxLng: 135.08,
    minLat: 18.15,
    maxLat: 53.55
  };
  
  // 如果提供了中心点和半径，生成中心点附近的坐标
  if (options.center && options.radius) {
    const [centerLng, centerLat] = options.center;
    const radiusInDegrees = options.radius / 111; // 粗略转换，1度约等于111公里
    
    const randomAngle = rng() * Math.PI * 2;
    const randomRadius = rng() * radiusInDegrees;
    
    const lng = centerLng + randomRadius * Math.cos(randomAngle);
    const lat = centerLat + randomRadius * Math.sin(randomAngle);
    
    return [lng, lat];
  }
  
  // 否则在中国范围内随机生成
  const lng = getRandomDecimal(DEFAULT_BOUNDS.minLng, DEFAULT_BOUNDS.maxLng, 6);
  const lat = getRandomDecimal(DEFAULT_BOUNDS.minLat, DEFAULT_BOUNDS.maxLat, 6);
  
  return [lng, lat];
}

/**
 * 判断是否生成异常数据
 * @param {number} anomalyRate 异常率（百分比）
 * @returns {boolean} 是否为异常数据
 */
function isAnomaly(anomalyRate = config.driving.anomalyRate) {
  return rng() * 100 < anomalyRate;
}

module.exports = {
  getRandomNumber,
  getRandomDecimal,
  getWeightedRandom,
  getRandomItem,
  generateLicensePlate,
  generateVIN,
  resetRng,
  generateUUID,
  generateGeoCoordinates,
  isAnomaly
};