// tools/data-generator/index.js
const fs = require('fs-extra');
const path = require('path');
const { program } = require('commander');
const config = require('./config');
const vehicleGenerator = require('./generators/vehicleGenerator');
const drivingGenerator = require('./generators/drivingGenerator');
const carbonGenerator = require('./generators/carbonGenerator');
const blockchainGenerator = require('./generators/blockchainGenerator');
const logger = require('./utils/logger');

// 命令行参数配置
program
  .option('-m, --mode <mode>', '数据生成模式 (batch/stream)', 'batch')
  .option('-o, --output <dir>', '输出目录')
  .option('-v, --vehicles <count>', '车辆数量')
  .option('-t, --time-range <range>', '时间范围 (YYYY-MM-DD,YYYY-MM-DD)')
  .option('-s, --seed <seed>', '随机种子')
  .parse(process.argv);

const options = program.opts();

// 更新配置
if (options.mode) config.global.mode = options.mode;
if (options.output) config.global.outputDir = options.output;
if (options.vehicles) config.vehicle.count = parseInt(options.vehicles);
if (options.timeRange) {
  const [start, end] = options.timeRange.split(',');
  if (start) config.global.timeRange.start = start;
  if (end) config.global.timeRange.end = end;
}
if (options.seed) config.global.seed = options.seed;

// 确保输出目录存在
fs.ensureDirSync(config.global.outputDir);

/**
 * 批量生成模式 - 一次性生成所有数据
 */
async function batchGeneration() {
  logger.info('开始批量生成数据...');
  
  try {
    // 第1步: 生成车辆数据
    logger.info(`开始生成${config.vehicle.count}辆车辆基础数据...`);
    const vehicles = await vehicleGenerator.generateVehicles(config.vehicle.count);
    const vehiclesPath = path.join(config.global.outputDir, 'vehicles.json');
    fs.writeJSONSync(vehiclesPath, vehicles, { spaces: 2 });
    logger.info(`车辆数据已保存到 ${vehiclesPath}`);
    
    // 第2步: 生成行驶数据
    logger.info('开始生成行驶数据...');
    const drivingData = await drivingGenerator.generateDrivingData(vehicles);
    const drivingPath = path.join(config.global.outputDir, 'driving-data.json');
    fs.writeJSONSync(drivingPath, drivingData, { spaces: 2 });
    logger.info(`行驶数据已保存到 ${drivingPath}`);
    
    // 第3步: 生成碳减排数据
    logger.info('开始生成碳减排数据...');
    const carbonData = await carbonGenerator.generateCarbonData(vehicles, drivingData);
    const carbonPath = path.join(config.global.outputDir, 'carbon-data.json');
    fs.writeJSONSync(carbonPath, carbonData, { spaces: 2 });
    logger.info(`碳减排数据已保存到 ${carbonPath}`);
    
    // 第4步: 生成区块链数据
    logger.info('开始生成区块链数据...');
    const blockchainData = await blockchainGenerator.generateBlockchainData(vehicles, drivingData, carbonData);
    const blockchainPath = path.join(config.global.outputDir, 'blockchain-data.json');
    fs.writeJSONSync(blockchainPath, blockchainData, { spaces: 2 });
    logger.info(`区块链数据已保存到 ${blockchainPath}`);
    
    // 生成数据统计
    const stats = {
      generatedAt: new Date().toISOString(),
      vehicleCount: vehicles.length,
      drivingRecordCount: drivingData.length,
      carbonRecordCount: carbonData.records.length,
      totalCarbonReduction: carbonData.summary.totalReduction,
      totalCredits: carbonData.summary.totalCredits,
      blockCount: blockchainData.blocks.length,
      transactionCount: blockchainData.transactions.length
    };
    
    const statsPath = path.join(config.global.outputDir, 'stats.json');
    fs.writeJSONSync(statsPath, stats, { spaces: 2 });
    logger.info(`数据生成完成! 统计信息已保存到 ${statsPath}`);
    
    return stats;
  } catch (error) {
    logger.error('数据生成过程中发生错误:', error);
    throw error;
  }
}

/**
 * 流式生成模式 - 持续生成数据流
 */
async function streamGeneration() {
  logger.info('开始流式生成数据...');
  
  try {
    // 第1步: 生成车辆数据
    logger.info(`开始生成${config.vehicle.count}辆车辆基础数据...`);
    const vehicles = await vehicleGenerator.generateVehicles(config.vehicle.count);
    const vehiclesPath = path.join(config.global.outputDir, 'vehicles.json');
    fs.writeJSONSync(vehiclesPath, vehicles, { spaces: 2 });
    logger.info(`车辆数据已保存到 ${vehiclesPath}`);
    
    // 第2步: 设置数据流生成循环
    logger.info('开始实时数据流生成...');
    
    // 持续生成数据的间隔 (毫秒)
    const interval = 60 * 1000; // 每分钟
    
    // 首次生成
    let drivingBatch = await drivingGenerator.generateRealtimeDrivingData(vehicles);
    let carbonBatch = await carbonGenerator.generateRealtimeCarbonData(vehicles, drivingBatch);
    let blockchainBatch = await blockchainGenerator.generateRealtimeBlockchainData(drivingBatch, carbonBatch);
    
    // 输出首批数据
    const streamDrivingPath = path.join(config.global.outputDir, 'stream-driving-data.json');
    const streamCarbonPath = path.join(config.global.outputDir, 'stream-carbon-data.json');
    const streamBlockchainPath = path.join(config.global.outputDir, 'stream-blockchain-data.json');
    
    fs.writeJSONSync(streamDrivingPath, drivingBatch, { spaces: 2 });
    fs.writeJSONSync(streamCarbonPath, carbonBatch, { spaces: 2 });
    fs.writeJSONSync(streamBlockchainPath, blockchainBatch, { spaces: 2 });
    
    // 设置定时器持续生成数据
    const timer = setInterval(async () => {
      try {
        // 生成新批次数据
        drivingBatch = await drivingGenerator.generateRealtimeDrivingData(vehicles);
        carbonBatch = await carbonGenerator.generateRealtimeCarbonData(vehicles, drivingBatch);
        blockchainBatch = await blockchainGenerator.generateRealtimeBlockchainData(drivingBatch, carbonBatch);
        
        // 追加到输出文件
        let existingDrivingData = [];
        let existingCarbonData = { records: [], summary: { totalReduction: 0, totalCredits: 0 } };
        let existingBlockchainData = { blocks: [], transactions: [] };
        
        if (fs.existsSync(streamDrivingPath)) {
          existingDrivingData = fs.readJSONSync(streamDrivingPath);
        }
        
        if (fs.existsSync(streamCarbonPath)) {
          existingCarbonData = fs.readJSONSync(streamCarbonPath);
        }
        
        if (fs.existsSync(streamBlockchainPath)) {
          existingBlockchainData = fs.readJSONSync(streamBlockchainPath);
        }
        
        // 合并数据
        const updatedDrivingData = [...existingDrivingData, ...drivingBatch];
        const updatedCarbonData = {
          records: [...existingCarbonData.records, ...carbonBatch.records],
          summary: {
            totalReduction: existingCarbonData.summary.totalReduction + carbonBatch.summary.totalReduction,
            totalCredits: existingCarbonData.summary.totalCredits + carbonBatch.summary.totalCredits
          }
        };
        const updatedBlockchainData = {
          blocks: [...existingBlockchainData.blocks, ...blockchainBatch.blocks],
          transactions: [...existingBlockchainData.transactions, ...blockchainBatch.transactions]
        };
        
        // 写入更新后的数据
        fs.writeJSONSync(streamDrivingPath, updatedDrivingData, { spaces: 2 });
        fs.writeJSONSync(streamCarbonPath, updatedCarbonData, { spaces: 2 });
        fs.writeJSONSync(streamBlockchainPath, updatedBlockchainData, { spaces: 2 });
        
        logger.info(`数据流更新完成，时间: ${new Date().toISOString()}`);
        
        // 如果设置了结束时间，检查是否需要停止
        if (process.env.STREAM_END_TIME) {
          const endTime = new Date(process.env.STREAM_END_TIME);
          if (new Date() >= endTime) {
            clearInterval(timer);
            logger.info('已达到指定结束时间，数据流生成已停止');
          }
        }
      } catch (error) {
        logger.error('数据流生成过程中发生错误:', error);
      }
    }, interval);
    
    // 处理进程终止信号
    process.on('SIGINT', () => {
      clearInterval(timer);
      logger.info('收到中断信号，数据流生成已停止');
      process.exit(0);
    });
    
    return { message: '数据流生成已启动' };
  } catch (error) {
    logger.error('初始化数据流生成过程中发生错误:', error);
    throw error;
  }
}

// 主函数
async function main() {
  logger.info(`数据生成器启动，模式: ${config.global.mode}`);
  
  if (config.global.mode === 'batch') {
    await batchGeneration();
  } else if (config.global.mode === 'stream') {
    await streamGeneration();
  } else {
    logger.error(`不支持的生成模式: ${config.global.mode}`);
    process.exit(1);
  }
}

// 执行主函数
if (require.main === module) {
  main().catch(error => {
    logger.error('程序执行失败:', error);
    process.exit(1);
  });
}

module.exports = {
  batchGeneration,
  streamGeneration
};