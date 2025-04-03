// tools/data-generator/models/blockchainModel.js
const logger = require('../utils/logger');

/**
 * 区块链数据模型定义和验证
 */
class BlockchainModel {
  /**
   * 交易类型枚举
   */
  static TRANSACTION_TYPES = ['vehicleRegister', 'dataUpload', 'creditsGenerate', 'creditsTransfer'];
  
  /**
   * 交易状态枚举
   */
  static TRANSACTION_STATUSES = ['pending', 'success', 'failed'];
  
  /**
   * 创建区块模型
   */
  static Block = class Block {
    /**
     * 创建区块模型实例
     * @param {Object} data 区块数据
     */
    constructor(data = {}) {
      this.number = data.number || 0;
      this.hash = data.hash || generateBlockHash();
      this.parentHash = data.parentHash || '0x0000000000000000000000000000000000000000000000000000000000000000';
      this.timestamp = data.timestamp || Math.floor(Date.now() / 1000);
      this.transactions = data.transactions || [];
      this.transactionCount = data.transactionCount || this.transactions.length;
      this.miner = data.miner || generateAddress();
      this.difficulty = data.difficulty || '0';
      this.totalDifficulty = data.totalDifficulty || '0';
      this.size = data.size || Math.floor(Math.random() * 6000) + 2000;
      this.gasUsed = data.gasUsed || 0;
      this.gasLimit = data.gasLimit || 30000000;
      this.extraData = data.extraData || '0x';
      this.createdAt = data.createdAt || new Date().toISOString();
    }
    
    /**
     * 验证区块数据
     * @returns {Object} 验证结果，包含是否通过和错误信息
     */
    validate() {
      const errors = [];
      
      // 验证区块号
      if (this.number < 0) {
        errors.push({ field: 'number', message: '区块号不能为负数' });
      }
      
      // 验证区块哈希
      if (!this.hash) {
        errors.push({ field: 'hash', message: '区块哈希不能为空' });
      } else {
        const hashRegex = /^0x[a-fA-F0-9]{64}$/;
        if (!hashRegex.test(this.hash)) {
          errors.push({ field: 'hash', message: '区块哈希格式不正确，应为0x开头的64位16进制字符' });
        }
      }
      
      // 验证父区块哈希
      if (!this.parentHash) {
        errors.push({ field: 'parentHash', message: '父区块哈希不能为空' });
      } else {
        const hashRegex = /^0x[a-fA-F0-9]{64}$/;
        if (!hashRegex.test(this.parentHash)) {
          errors.push({ field: 'parentHash', message: '父区块哈希格式不正确，应为0x开头的64位16进制字符' });
        }
      }
      
      // 验证时间戳
      if (!this.timestamp) {
        errors.push({ field: 'timestamp', message: '时间戳不能为空' });
      } else if (typeof this.timestamp !== 'number') {
        errors.push({ field: 'timestamp', message: '时间戳应为数字' });
      }
      
      // 验证交易数
      if (this.transactions.length !== this.transactionCount) {
        errors.push({ field: 'transactionCount', message: '交易数与交易数组长度不匹配' });
      }
      
      // 验证矿工地址
      if (!this.miner) {
        errors.push({ field: 'miner', message: '矿工地址不能为空' });
      } else {
        const addressRegex = /^0x[a-fA-F0-9]{40}$/;
        if (!addressRegex.test(this.miner)) {
          errors.push({ field: 'miner', message: '矿工地址格式不正确，应为0x开头的40位16进制字符' });
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
        number: this.number,
        hash: this.hash,
        parentHash: this.parentHash,
        timestamp: this.timestamp,
        transactions: this.transactions,
        transactionCount: this.transactionCount,
        miner: this.miner,
        difficulty: this.difficulty,
        totalDifficulty: this.totalDifficulty,
        size: this.size,
        gasUsed: this.gasUsed,
        gasLimit: this.gasLimit,
        extraData: this.extraData,
        createdAt: this.createdAt
      };
    }
  };
  
  /**
   * 创建交易模型
   */
  static Transaction = class Transaction {
    /**
     * 创建交易模型实例
     * @param {Object} data 交易数据
     */
    constructor(data = {}) {
      this.hash = data.hash || generateTxHash();
      this.blockNumber = data.blockNumber || null;
      this.blockHash = data.blockHash || null;
      this.from = data.from || generateAddress();
      this.to = data.to || generateAddress();
      this.value = data.value || '0';
      this.gas = data.gas || Math.floor(Math.random() * 79000) + 21000;
      this.gasPrice = data.gasPrice ? data.gasPrice.toString() : '20000000000';
      this.timestamp = data.timestamp || Math.floor(Date.now() / 1000);
      this.status = data.status || 'success';
      this.type = data.type || 'dataUpload';
      this.methodName = data.methodName || '';
      this.params = data.params || {};
      this.createdAt = data.createdAt || new Date().toISOString();
    }
    
    /**
     * 验证交易数据
     * @returns {Object} 验证结果，包含是否通过和错误信息
     */
    validate() {
      const errors = [];
      
      // 验证交易哈希
      if (!this.hash) {
        errors.push({ field: 'hash', message: '交易哈希不能为空' });
      } else {
        const hashRegex = /^0x[a-fA-F0-9]{64}$/;
        if (!hashRegex.test(this.hash)) {
          errors.push({ field: 'hash', message: '交易哈希格式不正确，应为0x开头的64位16进制字符' });
        }
      }
      
      // 验证发送方地址
      if (!this.from) {
        errors.push({ field: 'from', message: '发送方地址不能为空' });
      } else {
        const addressRegex = /^0x[a-fA-F0-9]{40}$/;
        if (!addressRegex.test(this.from)) {
          errors.push({ field: 'from', message: '发送方地址格式不正确，应为0x开头的40位16进制字符' });
        }
      }
      
      // 验证接收方地址
      if (!this.to) {
        errors.push({ field: 'to', message: '接收方地址不能为空' });
      } else {
        const addressRegex = /^0x[a-fA-F0-9]{40}$/;
        if (!addressRegex.test(this.to)) {
          errors.push({ field: 'to', message: '接收方地址格式不正确，应为0x开头的40位16进制字符' });
        }
      }
      
      // 验证时间戳
      if (!this.timestamp) {
        errors.push({ field: 'timestamp', message: '时间戳不能为空' });
      } else if (typeof this.timestamp !== 'number') {
        errors.push({ field: 'timestamp', message: '时间戳应为数字' });
      }
      
      // 验证状态
      if (!BlockchainModel.TRANSACTION_STATUSES.includes(this.status)) {
        errors.push({ 
          field: 'status', 
          message: `状态无效，应为 ${BlockchainModel.TRANSACTION_STATUSES.join(', ')} 其中之一` 
        });
      }
      
      // 验证类型
      if (!BlockchainModel.TRANSACTION_TYPES.includes(this.type)) {
        errors.push({ 
          field: 'type', 
          message: `类型无效，应为 ${BlockchainModel.TRANSACTION_TYPES.join(', ')} 其中之一` 
        });
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
        hash: this.hash,
        blockNumber: this.blockNumber,
        blockHash: this.blockHash,
        from: this.from,
        to: this.to,
        value: this.value,
        gas: this.gas,
        gasPrice: this.gasPrice,
        timestamp: this.timestamp,
        status: this.status,
        type: this.type,
        methodName: this.methodName,
        params: this.params,
        createdAt: this.createdAt
      };
    }
    
    /**
     * 分配到区块
     * @param {Object} block 区块数据
     * @returns {Transaction} 更新后的实例
     */
    assignToBlock(block) {
      this.blockNumber = block.number;
      this.blockHash = block.hash;
      return this;
    }
  };
  
  /**
   * 从数据生成区块
   * @param {Object} options 生成选项
   * @returns {Object} 区块和交易数据
   */
  static generateBlocks(options = {}) {
    const {
      initialBlockHeight = 10000,
      blockCount = 10,
      txPerBlock = 5,
      blockInterval = 12,  // 区块间隔，秒
      startTime = Date.now() / 1000 - blockCount * blockInterval,
      vehicleData = [],
      drivingData = [],
      carbonData = []
    } = options;
    
    const blocks = [];
    const transactions = [];
    
    // 生成初始区块哈希
    let previousHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
    if (options.previousHash) {
      previousHash = options.previousHash;
    }
    
    // 随机矿工地址列表
    const miners = [
      '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      '0xfaD932B89F530133A673162E94127C2De5E3a21E',
      '0x4E88B8A24cB2fc83Cc6D110fC9e99D1484FA47c0',
      '0x69A7a4e928aB8D59d98D489910B18f9F56d9AE32'
    ];
    
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
    
    // 按交易类型的概率分布
    const txTypeDistribution = options.txTypeDistribution || {
      'vehicleRegister': 5,
      'dataUpload': 60,
      'creditsGenerate': 25,
      'creditsTransfer': 10
    };
    
    // 生成每个区块
    for (let i = 0; i < blockCount; i++) {
      const blockNumber = initialBlockHeight + i;
      const blockTimestamp = Math.floor(startTime + i * blockInterval);
      const blockTxs = [];
      let blockGasUsed = 0;
      
      // 为每个区块生成交易
      for (let j = 0; j < txPerBlock; j++) {
        // 根据分布选择交易类型
        const txType = weightedRandomSelect(txTypeDistribution);
        
        // 根据交易类型生成交易
        let tx;
        switch (txType) {
          case 'vehicleRegister':
            // 从车辆数据中选择一个，如果有的话
            if (vehicleData.length > 0) {
              const vehicle = vehicleData[Math.floor(Math.random() * vehicleData.length)];
              tx = new BlockchainModel.Transaction({
                to: contracts.vehicleRegistry,
                methodName: 'registerVehicle',
                type: txType,
                params: {
                  vin: vehicle.vin,
                  model: vehicle.model,
                  batteryCapacity: vehicle.batteryCapacity
                },
                timestamp: blockTimestamp - Math.floor(Math.random() * blockInterval / 2)
              });
            } else {
              // 生成一个通用的车辆注册交易
              tx = new BlockchainModel.Transaction({
                to: contracts.vehicleRegistry,
                methodName: 'registerVehicle',
                type: txType,
                params: {
                  vin: `VIN${Math.floor(Math.random() * 1000000)}`,
                  model: 'Generic Model',
                  batteryCapacity: 75.0
                },
                timestamp: blockTimestamp - Math.floor(Math.random() * blockInterval / 2)
              });
            }
            break;
            
          case 'dataUpload':
            // 从行驶数据中选择一个，如果有的话
            if (drivingData.length > 0) {
              const record = drivingData[Math.floor(Math.random() * drivingData.length)];
              tx = new BlockchainModel.Transaction({
                to: contracts.vehicleRegistry,
                methodName: 'submitDrivingData',
                type: txType,
                params: {
                  vin: record.vin,
                  timestamp: Math.floor(new Date(record.timestamp).getTime() / 1000),
                  mileage: record.mileage,
                  energyConsumption: record.energyConsumption,
                  dataHash: `0x${Math.random().toString(16).slice(2)}`
                },
                timestamp: blockTimestamp - Math.floor(Math.random() * blockInterval / 2)
              });
            } else {
              // 生成一个通用的数据上传交易
              tx = new BlockchainModel.Transaction({
                to: contracts.vehicleRegistry,
                methodName: 'submitDrivingData',
                type: txType,
                params: {
                  vin: `VIN${Math.floor(Math.random() * 1000000)}`,
                  timestamp: blockTimestamp - 86400 + Math.floor(Math.random() * 86400),
                  mileage: Math.random() * 100,
                  energyConsumption: Math.random() * 20,
                  dataHash: `0x${Math.random().toString(16).slice(2)}`
                },
                timestamp: blockTimestamp - Math.floor(Math.random() * blockInterval / 2)
              });
            }
            break;
            
          case 'creditsGenerate':
            // 从碳减排数据中选择一个，如果有的话
            if (carbonData.length > 0 && carbonData.records) {
              const record = carbonData.records[Math.floor(Math.random() * carbonData.records.length)];
              tx = new BlockchainModel.Transaction({
                to: contracts.creditsGenerator,
                methodName: 'generateCredits',
                type: txType,
                params: {
                  calculationId: `0x${Math.random().toString(16).slice(2)}`,
                  vin: record.vin,
                  carbonReduction: record.carbonReduction
                },
                timestamp: blockTimestamp - Math.floor(Math.random() * blockInterval / 2)
              });
            } else {
              // 生成一个通用的积分生成交易
              tx = new BlockchainModel.Transaction({
                to: contracts.creditsGenerator,
                methodName: 'generateCredits',
                type: txType,
                params: {
                  calculationId: `0x${Math.random().toString(16).slice(2)}`,
                  vin: `VIN${Math.floor(Math.random() * 1000000)}`,
                  carbonReduction: Math.random() * 50
                },
                timestamp: blockTimestamp - Math.floor(Math.random() * blockInterval / 2)
              });
            }
            break;
            
          case 'creditsTransfer':
            // 生成积分转移交易
            tx = new BlockchainModel.Transaction({
              to: contracts.creditsManager,
              methodName: 'transferCredits',
              type: txType,
              params: {
                from: `0x${Math.random().toString(16).slice(2, 42)}`,
                to: `0x${Math.random().toString(16).slice(2, 42)}`,
                amount: Math.round(Math.random() * 1000) / 10
              },
              timestamp: blockTimestamp - Math.floor(Math.random() * blockInterval / 2)
            });
            break;
            
          default:
            tx = new BlockchainModel.Transaction({
              timestamp: blockTimestamp - Math.floor(Math.random() * blockInterval / 2)
            });
        }
        
        // 从发送方列表中随机选择
        tx.from = senders[Math.floor(Math.random() * senders.length)];
        
        // 累加Gas使用量
        blockGasUsed += tx.gas;
        
        // 添加到交易列表
        blockTxs.push(tx.hash);
        transactions.push(tx);
      }
      
      // 创建区块
      const block = new BlockchainModel.Block({
        number: blockNumber,
        parentHash: previousHash,
        timestamp: blockTimestamp,
        transactions: blockTxs,
        miner: miners[Math.floor(Math.random() * miners.length)],
        gasUsed: blockGasUsed,
        gasLimit: Math.max(blockGasUsed * 2, 8000000)
      });
      
      // 更新交易指向这个区块
      transactions
        .filter(tx => blockTxs.includes(tx.hash))
        .forEach(tx => tx.assignToBlock(block));
      
      // 添加到区块列表
      blocks.push(block);
      
      // 更新前一个区块哈希
      previousHash = block.hash;
    }
    
    return {
      blocks,
      transactions
    };
  }
}

/**
 * 生成随机区块哈希
 * @returns {string} 随机区块哈希
 */
function generateBlockHash() {
  return '0x' + Array.from({length: 64}, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
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

/**
 * 生成随机地址
 * @returns {string} 随机以太坊地址
 */
function generateAddress() {
  return '0x' + Array.from({length: 40}, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

/**
 * 根据权重随机选择项目
 * @param {Object} weights 权重对象，键为项目，值为权重
 * @returns {string} 选中的项目
 */
function weightedRandomSelect(weights) {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  
  let random = Math.random() * total;
  for (const [item, weight] of entries) {
    if ((random -= weight) < 0) {
      return item;
    }
  }
  
  return entries[0][0]; // 防止浮点数精度问题
}

module.exports = BlockchainModel;