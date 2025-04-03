// tools/data-generator/integrations/apiConnector.js
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { program } = require('commander');
const config = require('../config');
const logger = require('../utils/logger');

// 命令行参数配置
if (require.main === module) {
  program
    .option('-s, --submit <type>', '提交数据类型 (vehicles/driving/carbon/all)', 'all')
    .option('-t, --target <url>', 'API基础URL')
    .option('-k, --api-key <key>', 'API密钥')
    .parse(process.argv);
}

/**
 * 创建API客户端
 * @param {Object} options 选项
 * @returns {Object} API客户端实例
 */
function createApiClient(options = {}) {
  const baseURL = options.baseURL || config.global.integration.apiBaseUrl;
  const timeout = options.timeout || 30000; // 默认30秒超时
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  // 如果提供了API密钥，添加到请求头
  const apiKey = options.apiKey || process.env.API_KEY;
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  // 创建axios实例
  const client = axios.create({
    baseURL,
    timeout,
    headers
  });

  // 添加请求拦截器
  client.interceptors.request.use(
    (config) => {
      logger.debug(`API请求: ${config.method.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      logger.error('API请求错误:', error);
      return Promise.reject(error);
    }
  );

  // 添加响应拦截器
  client.interceptors.response.use(
    (response) => {
      logger.debug(`API响应: ${response.status} ${response.statusText}`);
      return response;
    },
    (error) => {
      if (error.response) {
        // 服务器返回错误
        logger.error(`API错误: ${error.response.status} ${error.response.statusText}`, 
          error.response.data);
      } else if (error.request) {
        // 请求已发送但未收到响应
        logger.error('API无响应:', error.request);
      } else {
        // 请求配置出错
        logger.error('API请求配置错误:', error.message);
      }
      return Promise.reject(error);
    }
  );

  return client;
}

/**
 * 提交车辆数据
 * @param {Object} client API客户端实例
 * @param {string} filePath 车辆数据文件路径
 * @returns {Object} 提交结果
 */
async function submitVehicles(client, filePath) {
  logger.info(`提交车辆数据: ${filePath}`);

  try {
    // 读取车辆数据文件
    const vehicles = fs.readJsonSync(filePath);

    if (!vehicles || !Array.isArray(vehicles) || vehicles.length === 0) {
      logger.warn('没有车辆数据可提交');
      return { success: false, message: '没有车辆数据', submittedCount: 0 };
    }

    // 记录计数
    let submittedCount = 0;
    let failedCount = 0;
    const errors = [];

    // 批量提交车辆数据
    const batchSize = 5; // 每批提交数量
    const batches = Math.ceil(vehicles.length / batchSize);

    for (let i = 0; i < batches; i++) {
      const startIdx = i * batchSize;
      const endIdx = Math.min(startIdx + batchSize, vehicles.length);
      const batch = vehicles.slice(startIdx, endIdx);

      logger.info(`提交车辆批次 ${i+1}/${batches} (${startIdx}-${endIdx-1})`);

      try {
        // 单个车辆提交
        for (const vehicle of batch) {
          try {
            // 调用API添加车辆
            const response = await client.post('/api/v1/vehicles', {
              vin: vehicle.vin,
              model: vehicle.model,
              licensePlate: vehicle.licensePlate,
              manufacturer: vehicle.manufacturer,
              productionYear: vehicle.productionYear,
              batteryCapacity: vehicle.batteryCapacity,
              maxRange: vehicle.maxRange
            });

            if (response.data && response.data.success) {
              submittedCount++;
            } else {
              failedCount++;
              errors.push({ vin: vehicle.vin, error: '提交失败', details: response.data });
            }
          } catch (error) {
            failedCount++;
            errors.push({ 
              vin: vehicle.vin, 
              error: '提交异常', 
              details: error.response ? error.response.data : error.message 
            });
          }
        }
      } catch (error) {
        logger.error(`批次提交失败 (${startIdx}-${endIdx-1}):`, error);
      }

      // 批次间延迟，避免请求过于频繁
      if (i < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    logger.info(`车辆数据提交完成：成功 ${submittedCount}/${vehicles.length}，失败 ${failedCount}`);

    return {
      success: submittedCount > 0,
      message: `成功提交 ${submittedCount}/${vehicles.length} 辆车辆数据`,
      submittedCount,
      failedCount,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    logger.error('提交车辆数据失败:', error);
    return { success: false, message: error.message, submittedCount: 0 };
  }
}

/**
 * 提交行驶数据
 * @param {Object} client API客户端实例
 * @param {string} filePath 行驶数据文件路径
 * @returns {Object} 提交结果
 */
async function submitDrivingData(client, filePath) {
  logger.info(`提交行驶数据: ${filePath}`);

  try {
    // 读取行驶数据文件
    const drivingRecords = fs.readJsonSync(filePath);

    if (!drivingRecords || !Array.isArray(drivingRecords) || drivingRecords.length === 0) {
      logger.warn('没有行驶数据可提交');
      return { success: false, message: '没有行驶数据', submittedCount: 0 };
    }

    // 记录计数
    let submittedCount = 0;
    let failedCount = 0;
    const errors = [];

    // 分批处理，每批20条记录
    const batchSize = 20;
    const batches = Math.ceil(drivingRecords.length / batchSize);

    for (let i = 0; i < batches; i++) {
      const startIdx = i * batchSize;
      const endIdx = Math.min(startIdx + batchSize, drivingRecords.length);
      const batch = drivingRecords.slice(startIdx, endIdx);

      logger.info(`提交行驶数据批次 ${i+1}/${batches} (${startIdx}-${endIdx-1})`);

      try {
        // 批量提交该批次数据
        const batchData = batch.map(record => ({
          id: record.id,
          vin: record.vin,
          timestamp: record.timestamp,
          mileage: record.mileage,
          energyConsumption: record.energyConsumption,
          speed: record.speed,
          batteryLevel: record.batteryLevel,
          latitude: record.position ? record.position[1] : 0,
          longitude: record.position ? record.position[0] : 0,
          isAbnormal: record.isAbnormal || false
        }));

        const response = await client.post('/api/v1/vehicles/driving-data/batch', {
          records: batchData
        });

        if (response.data && response.data.success) {
          submittedCount += batchData.length;
        } else {
          // 如果批量提交失败，尝试逐条提交
          for (const record of batch) {
            try {
              const singleResponse = await client.post(`/api/v1/vehicles/${record.vin}/driving-data`, {
                timestamp: record.timestamp,
                mileage: record.mileage,
                energyConsumption: record.energyConsumption,
                speed: record.speed,
                batteryLevel: record.batteryLevel,
                latitude: record.position ? record.position[1] : 0,
                longitude: record.position ? record.position[0] : 0,
                isAbnormal: record.isAbnormal || false
              });

              if (singleResponse.data && singleResponse.data.success) {
                submittedCount++;
              } else {
                failedCount++;
                errors.push({ id: record.id, vin: record.vin, error: '提交失败', details: singleResponse.data });
              }
            } catch (error) {
              failedCount++;
              errors.push({ 
                id: record.id, 
                vin: record.vin, 
                error: '提交异常', 
                details: error.response ? error.response.data : error.message 
              });
            }
          }
        }
      } catch (error) {
        logger.error(`批次提交失败 (${startIdx}-${endIdx-1}):`, error);
        failedCount += batch.length;
      }

      // 批次间延迟，避免请求过于频繁
      if (i < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    logger.info(`行驶数据提交完成：成功 ${submittedCount}/${drivingRecords.length}，失败 ${failedCount}`);

    return {
      success: submittedCount > 0,
      message: `成功提交 ${submittedCount}/${drivingRecords.length} 条行驶数据`,
      submittedCount,
      failedCount,
      errors: errors.length > 10 ? errors.slice(0, 10) : errors // 限制错误数量
    };
  } catch (error) {
    logger.error('提交行驶数据失败:', error);
    return { success: false, message: error.message, submittedCount: 0 };
  }
}

/**
 * 提交碳减排数据
 * @param {Object} client API客户端实例
 * @param {string} filePath 碳减排数据文件路径
 * @returns {Object} 提交结果
 */
async function submitCarbonData(client, filePath) {
  logger.info(`提交碳减排数据: ${filePath}`);

  try {
    // 读取碳减排数据文件
    const carbonData = fs.readJsonSync(filePath);

    if (!carbonData || !carbonData.records || !Array.isArray(carbonData.records) || carbonData.records.length === 0) {
      logger.warn('没有碳减排数据可提交');
      return { success: false, message: '没有碳减排数据', submittedCount: 0 };
    }

    const carbonRecords = carbonData.records;

    // 记录计数
    let submittedCount = 0;
    let failedCount = 0;
    const errors = [];

    // 分批处理
    const batchSize = 20;
    const batches = Math.ceil(carbonRecords.length / batchSize);

    for (let i = 0; i < batches; i++) {
      const startIdx = i * batchSize;
      const endIdx = Math.min(startIdx + batchSize, carbonRecords.length);
      const batch = carbonRecords.slice(startIdx, endIdx);

      logger.info(`提交碳减排数据批次 ${i+1}/${batches} (${startIdx}-${endIdx-1})`);

      try {
        // 批量提交该批次数据
        const batchData = batch.map(record => ({
          id: record.id,
          vin: record.vin,
          calculationDate: record.calculationDate,
          mileage: record.mileage,
          energyConsumption: record.energyConsumption,
          carbonReduction: record.carbonReduction,
          equivalentFuel: record.equivalentFuel,
          carbonCredits: record.carbonCredits,
          calculationMethod: record.calculationMethod,
          verificationStatus: record.verificationStatus
        }));

        const response = await client.post('/api/v1/analytics/carbon-reduction/batch', {
          records: batchData
        });

        if (response.data && response.data.success) {
          submittedCount += batchData.length;
        } else {
          // 如果批量提交失败，尝试逐条提交
          for (const record of batch) {
            try {
              const singleResponse = await client.post('/api/v1/analytics/carbon-reduction', {
                vin: record.vin,
                calculationDate: record.calculationDate,
                mileage: record.mileage,
                energyConsumption: record.energyConsumption,
                carbonReduction: record.carbonReduction,
                equivalentFuel: record.equivalentFuel,
                carbonCredits: record.carbonCredits,
                calculationMethod: record.calculationMethod
              });

              if (singleResponse.data && singleResponse.data.success) {
                submittedCount++;
              } else {
                failedCount++;
                errors.push({ id: record.id, vin: record.vin, error: '提交失败', details: singleResponse.data });
              }
            } catch (error) {
              failedCount++;
              errors.push({ 
                id: record.id, 
                vin: record.vin, 
                error: '提交异常', 
                details: error.response ? error.response.data : error.message 
              });
            }
          }
        }
      } catch (error) {
        logger.error(`批次提交失败 (${startIdx}-${endIdx-1}):`, error);
        failedCount += batch.length;
      }

      // 批次间延迟
      if (i < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    logger.info(`碳减排数据提交完成：成功 ${submittedCount}/${carbonRecords.length}，失败 ${failedCount}`);

    return {
      success: submittedCount > 0,
      message: `成功提交 ${submittedCount}/${carbonRecords.length} 条碳减排数据`,
      submittedCount,
      failedCount,
      errors: errors.length > 10 ? errors.slice(0, 10) : errors
    };
  } catch (error) {
    logger.error('提交碳减排数据失败:', error);
    return { success: false, message: error.message, submittedCount: 0 };
  }
}

/**
 * 提交所有数据
 * @param {Object} options 选项
 * @returns {Object} 提交结果
 */
async function submitAllData(options = {}) {
  const outputDir = config.global.outputDir;
  
  try {
    // 创建API客户端
    const client = createApiClient(options);
    
    // 提交车辆数据
    const vehiclesFile = path.join(outputDir, 'vehicles.json');
    const vehiclesResult = fs.existsSync(vehiclesFile) 
      ? await submitVehicles(client, vehiclesFile)
      : { success: false, message: '车辆数据文件不存在', submittedCount: 0 };
    
    // 提交行驶数据
    const drivingFile = path.join(outputDir, 'driving-data.json');
    const drivingResult = fs.existsSync(drivingFile)
      ? await submitDrivingData(client, drivingFile)
      : { success: false, message: '行驶数据文件不存在', submittedCount: 0 };
    
    // 提交碳减排数据
    const carbonFile = path.join(outputDir, 'carbon-data.json');
    const carbonResult = fs.existsSync(carbonFile)
      ? await submitCarbonData(client, carbonFile)
      : { success: false, message: '碳减排数据文件不存在', submittedCount: 0 };
    
    return {
      success: vehiclesResult.success || drivingResult.success || carbonResult.success,
      vehicles: vehiclesResult,
      driving: drivingResult,
      carbon: carbonResult
    };
  } catch (error) {
    logger.error('提交所有数据失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 测试API连接
 * @param {Object} options 选项
 * @returns {Object} 测试结果
 */
async function testConnection(options = {}) {
  try {
    const client = createApiClient(options);
    const response = await client.get('/api/v1/status');
    
    return {
      success: true,
      message: 'API连接成功',
      data: response.data
    };
  } catch (error) {
    logger.error('API连接测试失败:', error);
    return {
      success: false,
      message: '连接失败',
      error: error.message
    };
  }
}

/**
 * 从命令行运行
 */
async function runFromCommandLine() {
  const options = program.opts();
  const submitType = options.submit;
  const apiKey = options.apiKey;
  const targetUrl = options.target;
  
  const apiOptions = {};
  if (targetUrl) apiOptions.baseURL = targetUrl;
  if (apiKey) apiOptions.apiKey = apiKey;
  
  try {
    logger.info(`开始提交数据: ${submitType}`);
    
    // 测试连接
    const testResult = await testConnection(apiOptions);
    if (!testResult.success) {
      logger.error('API连接测试失败，将中止数据提交');
      process.exit(1);
    }
    
    // 根据类型提交数据
    const client = createApiClient(apiOptions);
    
    switch (submitType) {
      case 'all':
        await submitAllData(apiOptions);
        break;
      case 'vehicles':
        const vehiclesFile = path.join(config.global.outputDir, 'vehicles.json');
        await submitVehicles(client, vehiclesFile);
        break;
      case 'driving':
        const drivingFile = path.join(config.global.outputDir, 'driving-data.json');
        await submitDrivingData(client, drivingFile);
        break;
      case 'carbon':
        const carbonFile = path.join(config.global.outputDir, 'carbon-data.json');
        await submitCarbonData(client, carbonFile);
        break;
      default:
        logger.error(`不支持的提交类型: ${submitType}`);
    }
    
    logger.info('数据提交操作完成');
  } catch (error) {
    logger.error('数据提交操作失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  runFromCommandLine();
}

module.exports = {
  createApiClient,
  submitVehicles,
  submitDrivingData,
  submitCarbonData,
  submitAllData,
  testConnection
};