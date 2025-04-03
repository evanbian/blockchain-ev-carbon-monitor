// tools/data-generator/integrations/databaseConnector.js
const { Client } = require('pg');
const fs = require('fs-extra');
const path = require('path');
const { program } = require('commander');
const config = require('../config');
const logger = require('../utils/logger');

// 命令行参数配置
if (require.main === module) {
  program
    .option('-i, --import <type>', '导入数据类型 (vehicles/driving/carbon/blockchain/all)', 'all')
    .parse(process.argv);
}

/**
 * 创建数据库连接
 * @returns {Client} PostgreSQL客户端实例
 */
async function createConnection() {
  const { host, port, database, user, password } = config.global.integration.database;
  
  logger.info(`正在连接到数据库: ${host}:${port}/${database}`);
  
  const client = new Client({
    host,
    port,
    database,
    user,
    password
  });
  
  try {
    await client.connect();
    logger.info('数据库连接成功');
    return client;
  } catch (error) {
    logger.error('数据库连接失败:', error);
    throw error;
  }
}

/**
 * 关闭数据库连接
 * @param {Client} client PostgreSQL客户端实例
 */
async function closeConnection(client) {
  try {
    await client.end();
    logger.info('数据库连接已关闭');
  } catch (error) {
    logger.error('关闭数据库连接出错:', error);
  }
}

/**
 * 导入车辆数据到数据库
 * @param {Client} client PostgreSQL客户端实例
 * @param {string} filePath 车辆数据文件路径
 * @returns {number} 导入的记录数
 */
async function importVehicles(client, filePath) {
  logger.info(`导入车辆数据: ${filePath}`);
  
  try {
    // 读取车辆数据文件
    const vehicles = fs.readJsonSync(filePath);
    
    if (!vehicles || !Array.isArray(vehicles) || vehicles.length === 0) {
      logger.warn('没有车辆数据可导入');
      return 0;
    }
    
    // 记录计数
    let importedCount = 0;
    
    // 使用事务
    await client.query('BEGIN');
    
    // 准备插入语句
    const insertQuery = `
      INSERT INTO vehicles(
        vin, model, license_plate, manufacturer, production_year, 
        battery_capacity, max_range, register_date, status, 
        last_update_time, total_mileage, total_energy, 
        total_carbon_reduction, carbon_credits
      )
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (vin) 
      DO UPDATE SET
        model = EXCLUDED.model,
        license_plate = EXCLUDED.license_plate,
        manufacturer = EXCLUDED.manufacturer,
        production_year = EXCLUDED.production_year,
        battery_capacity = EXCLUDED.battery_capacity,
        max_range = EXCLUDED.max_range,
        register_date = EXCLUDED.register_date,
        status = EXCLUDED.status,
        last_update_time = EXCLUDED.last_update_time,
        total_mileage = EXCLUDED.total_mileage,
        total_energy = EXCLUDED.total_energy,
        total_carbon_reduction = EXCLUDED.total_carbon_reduction,
        carbon_credits = EXCLUDED.carbon_credits
    `;
    
    // 处理每个车辆记录
    for (const vehicle of vehicles) {
      try {
        await client.query(insertQuery, [
          vehicle.vin,
          vehicle.model,
          vehicle.licensePlate,
          vehicle.manufacturer,
          vehicle.productionYear,
          vehicle.batteryCapacity,
          vehicle.maxRange,
          vehicle.registerDate,
          vehicle.status,
          vehicle.lastUpdateTime,
          vehicle.totalMileage || 0,
          vehicle.totalEnergy || 0,
          vehicle.totalCarbonReduction || 0,
          vehicle.carbonCredits || 0
        ]);
        
        importedCount++;
      } catch (error) {
        logger.error(`导入车辆数据出错 (VIN: ${vehicle.vin}):`, error);
      }
    }
    
    // 提交事务
    await client.query('COMMIT');
    
    logger.info(`成功导入 ${importedCount}/${vehicles.length} 条车辆数据`);
    return importedCount;
  } catch (error) {
    // 回滚事务
    await client.query('ROLLBACK');
    logger.error('导入车辆数据失败:', error);
    throw error;
  }
}

/**
 * 导入行驶数据到数据库
 * @param {Client} client PostgreSQL客户端实例
 * @param {string} filePath 行驶数据文件路径
 * @returns {number} 导入的记录数
 */
async function importDrivingData(client, filePath) {
  logger.info(`导入行驶数据: ${filePath}`);
  
  try {
    // 读取行驶数据文件
    const drivingRecords = fs.readJsonSync(filePath);
    
    if (!drivingRecords || !Array.isArray(drivingRecords) || drivingRecords.length === 0) {
      logger.warn('没有行驶数据可导入');
      return 0;
    }
    
    // 记录计数
    let importedCount = 0;
    
    // 使用事务
    await client.query('BEGIN');
    
    // 准备插入语句
    const insertQuery = `
      INSERT INTO driving_records(
        id, vin, record_time, mileage, speed, battery_level, 
        energy_consumption, latitude, longitude, status_code, is_abnormal
      )
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) 
      DO NOTHING
    `;
    
    // 分批处理，每批1000条记录
    const batchSize = 1000;
    const batches = Math.ceil(drivingRecords.length / batchSize);
    
    for (let i = 0; i < batches; i++) {
      const startIdx = i * batchSize;
      const endIdx = Math.min(startIdx + batchSize, drivingRecords.length);
      const batch = drivingRecords.slice(startIdx, endIdx);
      
      logger.info(`处理批次 ${i+1}/${batches} (${startIdx}-${endIdx-1})`);
      
      // 处理每个行驶记录
      for (const record of batch) {
        try {
          const position = record.position || [0, 0];
          
          await client.query(insertQuery, [
            record.id,
            record.vin,
            record.timestamp,
            record.mileage,
            record.speed,
            record.batteryLevel,
            record.energyConsumption,
            position[1], // latitude
            position[0], // longitude
            record.abnormalType || 'normal',
            record.isAbnormal || false
          ]);
          
          importedCount++;
        } catch (error) {
          logger.error(`导入行驶数据出错 (ID: ${record.id}):`, error);
        }
      }
    }
    
    // 提交事务
    await client.query('COMMIT');
    
    logger.info(`成功导入 ${importedCount}/${drivingRecords.length} 条行驶数据`);
    return importedCount;
  } catch (error) {
    // 回滚事务
    await client.query('ROLLBACK');
    logger.error('导入行驶数据失败:', error);
    throw error;
  }
}

/**
 * 导入碳减排数据到数据库
 * @param {Client} client PostgreSQL客户端实例
 * @param {string} filePath 碳减排数据文件路径
 * @returns {number} 导入的记录数
 */
async function importCarbonData(client, filePath) {
  logger.info(`导入碳减排数据: ${filePath}`);
  
  try {
    // 读取碳减排数据文件
    const carbonData = fs.readJsonSync(filePath);
    
    if (!carbonData || !carbonData.records || !Array.isArray(carbonData.records) || carbonData.records.length === 0) {
      logger.warn('没有碳减排数据可导入');
      return 0;
    }
    
    const carbonRecords = carbonData.records;
    
    // 记录计数
    let importedCount = 0;
    
    // 使用事务
    await client.query('BEGIN');
    
    // 准备碳减排记录插入语句
    const insertCarbonQuery = `
      INSERT INTO carbon_records(
        id, vin, calculation_date, mileage, energy_consumption, 
        carbon_reduction, equivalent_fuel, calculation_method, 
        verification_status, blockchain_tx_hash, created_at
      )
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) 
      DO NOTHING
    `;
    
    // 准备碳积分记录插入语句
    const insertCreditQuery = `
      INSERT INTO carbon_credits(
        carbon_record_id, vin, credit_amount, credit_date, 
        blockchain_tx_hash, status, created_at
      )
      VALUES($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (carbon_record_id) 
      DO NOTHING
    `;
    
    // 分批处理，每批1000条记录
    const batchSize = 1000;
    const batches = Math.ceil(carbonRecords.length / batchSize);
    
    for (let i = 0; i < batches; i++) {
      const startIdx = i * batchSize;
      const endIdx = Math.min(startIdx + batchSize, carbonRecords.length);
      const batch = carbonRecords.slice(startIdx, endIdx);
      
      logger.info(`处理批次 ${i+1}/${batches} (${startIdx}-${endIdx-1})`);
      
      // 处理每个碳减排记录
      for (const record of batch) {
        try {
          // 插入碳减排记录
          await client.query(insertCarbonQuery, [
            record.id,
            record.vin,
            record.calculationDate,
            record.mileage,
            record.energyConsumption,
            record.carbonReduction,
            record.equivalentFuel,
            record.calculationMethod,
            record.verificationStatus,
            record.blockchainTxHash,
            record.calculationTimestamp
          ]);
          
          // 如果有碳积分，插入碳积分记录
          if (record.carbonCredits > 0) {
            await client.query(insertCreditQuery, [
              record.id, // 使用碳减排记录ID作为关联
              record.vin,
              record.carbonCredits,
              record.calculationDate,
              record.blockchainTxHash,
              'active', // 默认状态为active
              record.calculationTimestamp
            ]);
          }
          
          importedCount++;
        } catch (error) {
          logger.error(`导入碳减排数据出错 (ID: ${record.id}):`, error);
        }
      }
    }
    
    // 提交事务
    await client.query('COMMIT');
    
    logger.info(`成功导入 ${importedCount}/${carbonRecords.length} 条碳减排数据`);
    return importedCount;
  } catch (error) {
    // 回滚事务
    await client.query('ROLLBACK');
    logger.error('导入碳减排数据失败:', error);
    throw error;
  }
}

/**
 * 导入区块链数据到数据库
 * @param {Client} client PostgreSQL客户端实例
 * @param {string} filePath 区块链数据文件路径
 * @returns {Object} 导入的记录数统计
 */
async function importBlockchainData(client, filePath) {
  logger.info(`导入区块链数据: ${filePath}`);
  
  try {
    // 读取区块链数据文件
    const blockchainData = fs.readJsonSync(filePath);
    
    if (!blockchainData || !blockchainData.blocks || !blockchainData.transactions) {
      logger.warn('没有区块链数据可导入');
      return { blocks: 0, transactions: 0 };
    }
    
    const { blocks, transactions } = blockchainData;
    
    // 记录计数
    let importedBlocks = 0;
    let importedTxs = 0;
    
    // 使用事务
    await client.query('BEGIN');
    
    // 准备区块插入语句
    const insertBlockQuery = `
      INSERT INTO blockchain_blocks(
        number, hash, parent_hash, timestamp, transaction_count, 
        miner, size, gas_used, gas_limit, created_at
      )
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (hash) 
      DO NOTHING
    `;
    
    // 准备交易插入语句
    const insertTxQuery = `
      INSERT INTO blockchain_transactions(
        tx_hash, block_number, block_hash, from_address, to_address, 
        data_type, method_name, gas_used, status, timestamp, created_at
      )
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (tx_hash) 
      DO NOTHING
    `;
    
    // 处理区块数据
    for (const block of blocks) {
      try {
        await client.query(insertBlockQuery, [
          block.number,
          block.hash,
          block.parentHash,
          new Date(block.timestamp * 1000), // 转换为日期时间
          block.transactions.length,
          block.miner,
          block.size,
          block.gasUsed,
          block.gasLimit,
          block.createdAt || new Date().toISOString()
        ]);
        
        importedBlocks++;
      } catch (error) {
        logger.error(`导入区块数据出错 (块高: ${block.number}):`, error);
      }
    }
    
    // 处理交易数据
    for (const tx of transactions) {
      try {
        await client.query(insertTxQuery, [
          tx.hash,
          tx.blockNumber || 0, // 可能是待处理交易
          tx.blockHash || '',
          tx.from,
          tx.to,
          tx.type,
          tx.methodName,
          tx.gas,
          tx.status,
          new Date(tx.timestamp * 1000), // 转换为日期时间
          tx.createdAt || new Date().toISOString()
        ]);
        
        importedTxs++;
      } catch (error) {
        logger.error(`导入交易数据出错 (哈希: ${tx.hash}):`, error);
      }
    }
    
    // 提交事务
    await client.query('COMMIT');
    
    logger.info(`成功导入 ${importedBlocks}/${blocks.length} 个区块和 ${importedTxs}/${transactions.length} 笔交易`);
    return { blocks: importedBlocks, transactions: importedTxs };
  } catch (error) {
    // 回滚事务
    await client.query('ROLLBACK');
    logger.error('导入区块链数据失败:', error);
    throw error;
  }
}

/**
 * 导入所有数据到数据库
 * @returns {Object} 导入结果
 */
async function importAllData() {
  const outputDir = config.global.outputDir;
  let client;
  
  try {
    // 连接数据库
    client = await createConnection();
    
    // 导入车辆数据
    const vehiclesFile = path.join(outputDir, 'vehicles.json');
    const vehiclesCount = fs.existsSync(vehiclesFile) 
      ? await importVehicles(client, vehiclesFile)
      : 0;
    
    // 导入行驶数据
    const drivingFile = path.join(outputDir, 'driving-data.json');
    const drivingCount = fs.existsSync(drivingFile)
      ? await importDrivingData(client, drivingFile)
      : 0;
    
    // 导入碳减排数据
    const carbonFile = path.join(outputDir, 'carbon-data.json');
    const carbonCount = fs.existsSync(carbonFile)
      ? await importCarbonData(client, carbonFile)
      : 0;
    
    // 导入区块链数据
    const blockchainFile = path.join(outputDir, 'blockchain-data.json');
    const blockchainResult = fs.existsSync(blockchainFile)
      ? await importBlockchainData(client, blockchainFile)
      : { blocks: 0, transactions: 0 };
    
    return {
      success: true,
      vehiclesCount,
      drivingCount,
      carbonCount,
      blockchainBlocks: blockchainResult.blocks,
      blockchainTransactions: blockchainResult.transactions
    };
  } catch (error) {
    logger.error('导入所有数据失败:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    // 关闭数据库连接
    if (client) {
      await closeConnection(client);
    }
  }
}

/**
 * 从命令行运行导入操作
 */
async function runFromCommandLine() {
  const options = program.opts();
  const importType = options.import;
  
  try {
    logger.info(`开始导入数据: ${importType}`);
    
    switch (importType) {
      case 'all':
        await importAllData();
        break;
      case 'vehicles':
        const client = await createConnection();
        const vehiclesFile = path.join(config.global.outputDir, 'vehicles.json');
        await importVehicles(client, vehiclesFile);
        await closeConnection(client);
        break;
      case 'driving':
        const client2 = await createConnection();
        const drivingFile = path.join(config.global.outputDir, 'driving-data.json');
        await importDrivingData(client2, drivingFile);
        await closeConnection(client2);
        break;
      case 'carbon':
        const client3 = await createConnection();
        const carbonFile = path.join(config.global.outputDir, 'carbon-data.json');
        await importCarbonData(client3, carbonFile);
        await closeConnection(client3);
        break;
      case 'blockchain':
        const client4 = await createConnection();
        const blockchainFile = path.join(config.global.outputDir, 'blockchain-data.json');
        await importBlockchainData(client4, blockchainFile);
        await closeConnection(client4);
        break;
      default:
        logger.error(`不支持的导入类型: ${importType}`);
    }
    
    logger.info('导入操作完成');
  } catch (error) {
    logger.error('导入操作失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件，则执行导入操作
if (require.main === module) {
  runFromCommandLine();
}

module.exports = {
  createConnection,
  closeConnection,
  importVehicles,
  importDrivingData,
  importCarbonData,
  importBlockchainData,
  importAllData
};