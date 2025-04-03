// tools/data-generator/utils/fileUtils.js
const fs = require('fs-extra');
const path = require('path');
const logger = require('./logger');
const config = require('../config');

/**
 * 确保目录存在，不存在则创建
 * @param {string} dirPath 目录路径
 * @returns {void}
 */
function ensureDirectory(dirPath) {
  try {
    fs.ensureDirSync(dirPath);
  } catch (error) {
    logger.error(`创建目录失败: ${dirPath}`, error);
    throw error;
  }
}

/**
 * 写入JSON文件
 * @param {string} filePath 文件路径
 * @param {Object|Array} data 数据
 * @param {Object} options 选项
 * @returns {void}
 */
function writeJsonFile(filePath, data, options = {}) {
  try {
    const { spaces = 2, append = false } = options;
    
    // 如果是追加模式，且文件存在，则读取并合并数据
    if (append && fs.existsSync(filePath)) {
      const existingData = readJsonFile(filePath);
      
      if (Array.isArray(data) && Array.isArray(existingData)) {
        data = [...existingData, ...data];
      } else if (typeof data === 'object' && typeof existingData === 'object') {
        data = { ...existingData, ...data };
      } else {
        logger.warn(`追加模式下，数据类型不匹配: ${typeof existingData} vs ${typeof data}`);
      }
    }
    
    // 确保目录存在
    ensureDirectory(path.dirname(filePath));
    
    // 写入文件
    fs.writeJsonSync(filePath, data, { spaces });
    logger.debug(`写入JSON文件成功: ${filePath}`);
  } catch (error) {
    logger.error(`写入JSON文件失败: ${filePath}`, error);
    throw error;
  }
}

/**
 * 读取JSON文件
 * @param {string} filePath 文件路径
 * @returns {Object|Array} 读取的数据
 */
function readJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      logger.warn(`文件不存在: ${filePath}`);
      return null;
    }
    
    return fs.readJsonSync(filePath);
  } catch (error) {
    logger.error(`读取JSON文件失败: ${filePath}`, error);
    throw error;
  }
}

/**
 * 导出数据到文件
 * @param {string} name 文件名（不含扩展名）
 * @param {Object|Array} data 数据
 * @param {Object} options 选项
 * @returns {string} 完整文件路径
 */
function exportData(name, data, options = {}) {
  const { directory = config.global.outputDir, format = 'json', append = false } = options;
  
  // 确保目录存在
  ensureDirectory(directory);
  
  // 构建文件路径
  const filePath = path.join(directory, `${name}.${format}`);
  
  // 根据格式导出数据
  switch (format.toLowerCase()) {
    case 'json':
      writeJsonFile(filePath, data, { append });
      break;
    case 'csv':
      // TODO: 实现CSV格式导出
      logger.warn('CSV导出功能尚未实现');
      break;
    default:
      throw new Error(`不支持的格式: ${format}`);
  }
  
  return filePath;
}

/**
 * 导入数据从文件
 * @param {string} filePath 文件路径
 * @returns {Object|Array} 读取的数据
 */
function importData(filePath) {
  // 获取文件扩展名
  const ext = path.extname(filePath).toLowerCase();
  
  // 根据扩展名导入数据
  switch (ext) {
    case '.json':
      return readJsonFile(filePath);
    case '.csv':
      // TODO: 实现CSV格式导入
      logger.warn('CSV导入功能尚未实现');
      return null;
    default:
      throw new Error(`不支持的文件格式: ${ext}`);
  }
}

/**
 * 清空目录
 * @param {string} directory 目录路径
 * @returns {void}
 */
function cleanDirectory(directory = config.global.outputDir) {
  try {
    // 确保目录存在
    ensureDirectory(directory);
    
    // 读取目录内容
    const files = fs.readdirSync(directory);
    
    // 删除每个文件
    for (const file of files) {
      const filePath = path.join(directory, file);
      fs.removeSync(filePath);
      logger.debug(`删除文件: ${filePath}`);
    }
    
    logger.info(`目录已清空: ${directory}`);
  } catch (error) {
    logger.error(`清空目录失败: ${directory}`, error);
    throw error;
  }
}

/**
 * 获取模板文件路径
 * @param {string} templateName 模板名称
 * @returns {string} 模板文件路径
 */
function getTemplatePath(templateName) {
  return path.join(__dirname, '../templates', templateName);
}

module.exports = {
  ensureDirectory,
  writeJsonFile,
  readJsonFile,
  exportData,
  importData,
  cleanDirectory,
  getTemplatePath
};