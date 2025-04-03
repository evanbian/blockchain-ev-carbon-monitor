// tools/data-generator/generators/blockchainGenerator.js
const config = require('../config');
const randomUtils = require('../utils/randomUtils');
const dateUtils = require('../utils/dateUtils');
const fileUtils = require('../utils/fileUtils');
const logger = require('../utils/logger');
const path = require('path');
const moment = require('moment');

/**
 * 生成区块数据
 * @param {number} blockNumber 区块号
 * @param {string} previousHash 前一个区块的哈希
 * @param {Array} transactions 交易数组
 * @param {number} timestamp 时间戳（毫秒）
 * @returns {Object} 区块数据
 */
function generateBlock(blockNumber, previousHash, transactions, timestamp) {
  // 生成区块哈希
  const blockHash = `0x${randomUtils.getRandomNumber(1000000, 9999999).toString(16)}${randomUtils.getRandomNumber(10000000, 99999999).toString(16)}`;
  
  // 生成矿工地址
  const miners = [
    '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    '0xfaD932B89F530133A673162E94127C2De5E3a21E',
    '0x4E88B8A24cB2fc83Cc6D110fC9e99D1484FA47c0',
    '0x69A7a4e928aB8D59d98D489910B18f9F56d9AE32'
  ];
  const miner = randomUtils.getRandomItem(miners);
  
  // 生成区块大小
  const size = randomUtils.getRandomNumber(2000, 8000);
  
  // 生成gasUsed和gasLimit
  const gasUsed = transactions.reduce((sum, tx) => sum + tx.gas, 0);
  const gasLimit = Math.max(gasUsed * 1.5, 30000000);
  
  // 生成区块
  return {
    number: blockNumber,
    hash: blockHash,
    parentHash: previousHash,
    timestamp: Math.floor(timestamp / 1000), // 转换为秒
    transactions: transactions.map(tx => tx.hash),
    transactionCount: transactions.length,
    miner,
    difficulty: '0',
    totalDifficulty: '0',
    size,
    gasUsed,
    gasLimit,
    extraData: '0x',
    createdAt: new Date(timestamp).toISOString()
  };
}

/**
 * 生成交易数据
 * @param {string} type 交易类型
 * @param {Object} data 交易相关数据
 * @param {number} timestamp 时间戳（毫秒）
 * @returns {Object} 交易数据
 */
function generateTransaction(type, data, timestamp) {
  // 生成交易哈希
  const txHash = `0x${randomUtils.getRandomNumber(1000000, 9999999).toString(16)}${randomUtils.getRandomNumber(10000000, 99999999).toString(16)}`;
  
  // 合约地址列表
  const contracts = {
    'vehicleRegistry': '0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8',
    'carbonCalculator': '0xf8e81D47203A594245E36C48e151709F0C19fBe8',
    'creditsGenerator': '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
    'creditsManager': '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B'
  };
  
  // 发送方地址列表
  const senders = [
    '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    '0xfaD932B89F530133A673162E94127C2De5E3a21E',
    '0x4E88B8A24cB2fc83Cc6D110fC9e99D1484FA47c0'
  ];
  
  // 根据交易类型设置合约地址和方法名
  let to, methodName, params;
  switch (type) {
    case 'vehicleRegister':
      to = contracts.vehicleRegistry;
      methodName = 'registerVehicle';
      params = {
        vin: data.vin,
        model: data.model,
        batteryCapacity: data.batteryCapacity
      };
      break;
      
    case 'dataUpload':
      to = contracts.vehicleRegistry;
      methodName = 'submitDrivingData';
      params = {
        vin: data.vin,
        timestamp: data.timestamp,
        mileage: data.mileage,
        energyConsumption: data.energyConsumption,
        dataHash: `0x${randomUtils.getRandomNumber(1000000, 9999999).toString(16)}`
      };
      break;
      
    case 'creditsGenerate':
      to = contracts.creditsGenerator;
      methodName = 'generateCredits';
      params = {
        calculationId: `0x${randomUtils.getRandomNumber(1000000, 9999999).toString(16)}`,
        vin: data.vin,
        carbonReduction: data.carbonReduction
      };
      break;
      
    case 'creditsTransfer':
      to = contracts.creditsManager;
      methodName = 'transferCredits';
      params = {
        from: `0x${randomUtils.getRandomNumber(1000000, 9999999).toString(16)}`,
        to: `0x${randomUtils.getRandomNumber(1000000, 9999999).toString(16)}`,
        amount: randomUtils.getRandomDecimal(1, 50, 2)
      };
      break;
      
    default:
      to = contracts.vehicleRegistry;
      methodName = 'unknownMethod';
      params = {};
  }
  
  // 生成from地址
  const from = randomUtils.getRandomItem(senders);
  
  // 生成gas和gasPrice
  const gas = randomUtils.getRandomNumber(config.blockchain.gas.min, config.blockchain.gas.max);
  const gasPrice = randomUtils.getRandomNumber(config.blockchain.gasPrice.min, config.blockchain.gasPrice.max);
  
  // 生成交易
  return {
    hash: txHash,
    from,
    to,
    value: '0',
    gas,
    gasPrice: gasPrice.toString(),
    timestamp: Math.floor(timestamp / 1000), // 转换为秒
    status: 'success',
    type,
    methodName,
    params,
    createdAt: new Date(timestamp).toISOString()
  };
}

/**
 * 生成区块链数据
 * @param {Array} vehicles 车辆数据数组
 * @param {Array} drivingRecords 行驶记录数组
 * @param {Object} carbonData 碳减排数据
 * @returns {Object} 区块链数据对象，包含blocks和transactions
 */
async function generateBlockchainData(vehicles, drivingRecords, carbonData) {
  logger.info('开始生成区块链数据...');
  
  // 初始化区块号
  const initialBlockHeight = config.blockchain.initialBlockHeight;
  let currentBlockHeight = initialBlockHeight;
  
  // 初始化区块哈希
  let previousHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
  
  // 获取时间范围
  const { start, end } = dateUtils.getTimeRange();
  let currentTimestamp = start.valueOf();
  const endTimestamp = end.valueOf();
  
  // 区块数据和交易数据
  const blocks = [];
  const transactions = [];
  
  // 生成车辆注册交易
  const vehicleRegisterTxs = vehicles.map(vehicle => {
    const txTimestamp = moment(vehicle.registerDate).valueOf();
    return generateTransaction('vehicleRegister', vehicle, txTimestamp);
  });
  
  // 添加车辆注册交易
  transactions.push(...vehicleRegisterTxs);
  
  // 生成行驶数据上传交易
  const dataUploadTxs = [];
  for (const record of drivingRecords) {
    // 只为10%的行驶记录生成交易（避免数据过多）
    if (randomUtils.getRandomNumber(1, 100) <= 10) {
      const txTimestamp = new Date(record.timestamp).valueOf();
      dataUploadTxs.push(generateTransaction('dataUpload', record, txTimestamp));
    }
  }
  
  // 添加行驶数据上传交易
  transactions.push(...dataUploadTxs);
  
  // 生成碳积分生成交易
  const creditsGenerateTxs = [];
  for (const record of carbonData.records) {
    // 只为验证状态的碳减排记录生成交易
    if (record.verificationStatus === 'verified') {
      const txTimestamp = new Date(record.calculationTimestamp).valueOf();
      creditsGenerateTxs.push(generateTransaction('creditsGenerate', record, txTimestamp));
    }
  }
  
  // 添加碳积分生成交易
  transactions.push(...creditsGenerateTxs);
  
  // 生成碳积分转移交易（随机生成）
  const creditsTransferCount = Math.floor(creditsGenerateTxs.length * 0.1); // 约10%的积分生成会有转移
  for (let i = 0; i < creditsTransferCount; i++) {
    const txTimestamp = start.valueOf() + Math.random() * (end.valueOf() - start.valueOf());
    const dummyData = { vin: vehicles[randomUtils.getRandomNumber(0, vehicles.length - 1)].vin };
    const tx = generateTransaction('creditsTransfer', dummyData, txTimestamp);
    transactions.push(tx);
  }
  
  // 按时间排序所有交易
  transactions.sort((a, b) => a.timestamp - b.timestamp);
  
  // 按区块间隔生成区块
  const blockIntervalMs = config.blockchain.blockInterval * 1000; // 转换为毫秒
  let pendingTxs = [];
  
  while (currentTimestamp <= endTimestamp) {
    // 收集当前时间戳之前的交易
    while (
      pendingTxs.length < transactions.length &&
      transactions[pendingTxs.length].timestamp * 1000 <= currentTimestamp
    ) {
      pendingTxs.push(transactions[pendingTxs.length]);
    }
    
    // 如果有待处理的交易，生成区块
    if (pendingTxs.length > 0) {
      // 每个区块最多包含10笔交易
      const blockTxs = pendingTxs.splice(0, Math.min(10, pendingTxs.length));
      
      // 生成区块
      const block = generateBlock(currentBlockHeight, previousHash, blockTxs, currentTimestamp);
      blocks.push(block);
      
      // 更新区块号和前一个区块哈希
      currentBlockHeight++;
      previousHash = block.hash;
    }
    
    // 递增时间戳
    currentTimestamp += blockIntervalMs;
  }
  
  logger.info(`区块链数据生成完成，共${blocks.length}个区块，${transactions.length}笔交易`);
  
  // 整合数据对象
  const blockchainData = {
    blocks,
    transactions
  };
  
  // 如果配置为输出到文件，则保存数据
  if (config.global.integration.target.includes('file')) {
    const outputPath = path.join(config.global.outputDir, 'blockchain-data.json');
    fileUtils.writeJsonFile(outputPath, blockchainData);
    logger.info(`区块链数据已保存到: ${outputPath}`);
  }
  
  return blockchainData;
}

/**
 * 生成实时区块链数据（用于流式模式）
 * @param {Array} drivingRecords 实时行驶记录数组
 * @param {Object} carbonData 实时碳减排数据
 * @returns {Object} 实时区块链数据对象
 */
async function generateRealtimeBlockchainData(drivingRecords, carbonData) {
  logger.info('生成实时区块链数据...');
  
  // 读取现有区块链数据
  let existingData = loadBlockchainData();
  
  // 如果没有现有数据，则初始化
  if (!existingData || !existingData.blocks || existingData.blocks.length === 0) {
    existingData = {
      blocks: [],
      transactions: []
    };
  }
  
  // 获取最新区块高度和哈希
  let currentBlockHeight = existingData.blocks.length > 0 
    ? existingData.blocks[existingData.blocks.length - 1].number + 1 
    : config.blockchain.initialBlockHeight;
    
  let previousHash = existingData.blocks.length > 0 
    ? existingData.blocks[existingData.blocks.length - 1].hash 
    : '0x0000000000000000000000000000000000000000000000000000000000000000';
  
  // 交易数据
  const transactions = [];
  
  // 生成行驶数据上传交易
  for (const record of drivingRecords) {
    // 为50%的行驶记录生成交易
    if (randomUtils.getRandomNumber(1, 100) <= 50) {
      const txTimestamp = new Date(record.timestamp).valueOf();
      transactions.push(generateTransaction('dataUpload', record, txTimestamp));
    }
  }
  
  // 生成碳积分生成交易
  for (const record of carbonData.records) {
    // 为所有碳减排记录生成交易
    const txTimestamp = new Date(record.calculationTimestamp).valueOf();
    transactions.push(generateTransaction('creditsGenerate', record, txTimestamp));
  }
  
  // 按时间排序所有交易
  transactions.sort((a, b) => a.timestamp - b.timestamp);
  
  // 生成区块
  const blocks = [];
  if (transactions.length > 0) {
    // 生成区块（所有交易放入一个区块）
    const block = generateBlock(currentBlockHeight, previousHash, transactions, Date.now());
    blocks.push(block);
  }
  
  logger.info(`实时区块链数据生成完成，共${blocks.length}个区块，${transactions.length}笔交易`);
  
  // 整合数据对象
  return {
    blocks,
    transactions
  };
}

/**
 * 从文件加载区块链数据
 * @returns {Object} 区块链数据对象
 */
function loadBlockchainData() {
  const filePath = path.join(config.global.outputDir, 'blockchain-data.json');
  if (fileUtils.readJsonFile(filePath)) {
    return fileUtils.readJsonFile(filePath);
  }
  
  logger.warn(`区块链数据文件不存在: ${filePath}`);
  return { blocks: [], transactions: [] };
}

// 如果直接运行此文件，则生成区块链数据
if (require.main === module) {
  const vehicleGenerator = require('./vehicleGenerator');
  const drivingGenerator = require('./drivingGenerator');
  const carbonGenerator = require('./carbonGenerator');
  
  Promise.all([
    vehicleGenerator.loadVehicles(),
    drivingGenerator.loadDrivingData(),
    carbonGenerator.loadCarbonData()
  ])
    .then(([vehicles, drivingRecords, carbonData]) => 
      generateBlockchainData(vehicles, drivingRecords, carbonData)
    )
    .then(() => logger.info('区块链数据生成完成'))
    .catch(err => logger.error('区块链数据生成失败', err));
}

module.exports = {
  generateBlock,
  generateTransaction,
  generateBlockchainData,
  generateRealtimeBlockchainData,
  loadBlockchainData
};