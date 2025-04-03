// tools/data-generator/integrations/blockchainConnector.js
const Web3 = require('web3');
const fs = require('fs-extra');
const path = require('path');
const { program } = require('commander');
const config = require('../config');
const logger = require('../utils/logger');

// 命令行参数配置
if (require.main === module) {
  program
    .option('-o, --operation <type>', '区块链操作 (deploy/submit/verify)', 'status')
    .option('-c, --contract <name>', '智能合约名称')
    .option('-d, --data <file>', '数据文件路径')
    .parse(process.argv);
}

/**
 * 创建Web3连接
 * @param {Object} options 连接选项
 * @returns {Web3} Web3实例
 */
function createWeb3Connection(options = {}) {
  const provider = options.provider || config.global.integration.blockchain.provider;
  
  logger.info(`正在连接到区块链: ${provider}`);
  
  try {
    const web3 = new Web3(provider);
    return web3;
  } catch (error) {
    logger.error('创建Web3连接失败:', error);
    throw error;
  }
}

/**
 * 检查区块链连接状态
 * @param {Web3} web3 Web3实例
 * @returns {Promise<Object>} 连接状态信息
 */
async function checkConnection(web3) {
  try {
    // 检查是否连接到节点
    const isConnected = await web3.eth.net.isListening();
    
    if (!isConnected) {
      return {
        success: false,
        message: '无法连接到区块链节点'
      };
    }
    
    // 获取网络ID
    const networkId = await web3.eth.net.getId();
    
    // 获取最新区块号
    const blockNumber = await web3.eth.getBlockNumber();
    
    // 获取可用账户
    const accounts = await web3.eth.getAccounts();
    
    return {
      success: true,
      message: '区块链连接成功',
      networkId,
      blockNumber,
      accounts
    };
  } catch (error) {
    logger.error('检查区块链连接失败:', error);
    return {
      success: false,
      message: `检查区块链连接失败: ${error.message}`
    };
  }
}

/**
 * 获取账户
 * @param {Web3} web3 Web3实例
 * @param {string} privateKey 私钥(可选)
 * @returns {Object} 账户对象
 */
async function getAccount(web3, privateKey) {
  try {
    // 如果提供了私钥，使用私钥创建账户
    if (privateKey) {
      // 确保私钥格式正确
      const normalizedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
      const account = web3.eth.accounts.privateKeyToAccount(normalizedKey);
      web3.eth.accounts.wallet.add(account);
      
      logger.debug(`使用私钥创建账户: ${account.address}`);
      return account;
    }
    
    // 否则使用节点解锁的账户
    const accounts = await web3.eth.getAccounts();
    
    if (accounts.length === 0) {
      throw new Error('没有可用的账户');
    }
    
    logger.debug(`使用节点账户: ${accounts[0]}`);
    return { address: accounts[0] };
  } catch (error) {
    logger.error('获取账户失败:', error);
    throw error;
  }
}

/**
 * 加载合约ABI
 * @param {string} contractName 合约名称
 * @returns {Object} 合约ABI
 */
function loadContractABI(contractName) {
  try {
    // 尝试从智能合约构建目录加载ABI
    const abiPath = path.join(__dirname, '../../../', 'smart-contracts/build/contracts', `${contractName}.json`);
    
    if (!fs.existsSync(abiPath)) {
      throw new Error(`找不到合约ABI文件: ${abiPath}`);
    }
    
    const contractJson = fs.readJsonSync(abiPath);
    return contractJson.abi;
  } catch (error) {
    logger.error(`加载合约ABI失败: ${contractName}`, error);
    throw error;
  }
}

/**
 * 加载已部署的合约地址
 * @returns {Object} 合约地址映射
 */
function loadContractAddresses() {
  try {
    const addressesPath = path.join(__dirname, '../../../', 'smart-contracts/deployed-addresses.json');
    
    if (!fs.existsSync(addressesPath)) {
      logger.warn('找不到已部署合约地址文件，将使用配置中的地址');
      return {};
    }
    
    return fs.readJsonSync(addressesPath);
  } catch (error) {
    logger.error('加载已部署合约地址失败', error);
    return {};
  }
}

/**
 * 获取合约实例
 * @param {Web3} web3 Web3实例
 * @param {string} contractName 合约名称
 * @param {string} contractAddress 合约地址(可选)
 * @returns {Object} 合约实例
 */
function getContract(web3, contractName, contractAddress) {
  try {
    // 加载合约ABI
    const abi = loadContractABI(contractName);
    
    // 如果未提供合约地址，尝试从已部署地址文件获取
    if (!contractAddress) {
      const deployedAddresses = loadContractAddresses();
      contractAddress = deployedAddresses[contractName];
      
      // 如果仍然没有找到地址，抛出错误
      if (!contractAddress) {
        throw new Error(`找不到合约地址: ${contractName}`);
      }
    }
    
    // 创建合约实例
    const contract = new web3.eth.Contract(abi, contractAddress);
    
    logger.debug(`创建合约实例: ${contractName} @ ${contractAddress}`);
    return contract;
  } catch (error) {
    logger.error(`获取合约实例失败: ${contractName}`, error);
    throw error;
  }
}

/**
 * 部署智能合约
 * @param {Web3} web3 Web3实例
 * @param {Object} account 账户对象
 * @param {string} contractName 合约名称
 * @param {Array} constructorArgs 构造函数参数
 * @returns {Promise<Object>} 部署结果
 */
async function deployContract(web3, account, contractName, constructorArgs = []) {
  try {
    // 加载合约ABI和字节码
    const contractPath = path.join(__dirname, '../../../', 'smart-contracts/build/contracts', `${contractName}.json`);
    
    if (!fs.existsSync(contractPath)) {
      throw new Error(`找不到合约文件: ${contractPath}`);
    }
    
    const contractJson = fs.readJsonSync(contractPath);
    const abi = contractJson.abi;
    const bytecode = contractJson.bytecode;
    
    // 创建合约部署交易
    const contract = new web3.eth.Contract(abi);
    const deployTx = contract.deploy({
      data: bytecode,
      arguments: constructorArgs
    });
    
    // 估算Gas
    const gas = await deployTx.estimateGas({ from: account.address });
    
    // 获取Gas价格
    const gasPrice = await web3.eth.getGasPrice();
    
    // 发送交易
    logger.info(`正在部署合约: ${contractName}`);
    
    const deployedContract = await deployTx.send({
      from: account.address,
      gas,
      gasPrice
    });
    
    // 保存部署地址
    const deployedAddress = deployedContract.options.address;
    logger.info(`合约已部署: ${contractName} @ ${deployedAddress}`);
    
    // 更新已部署合约地址文件
    const addressesPath = path.join(__dirname, '../../../', 'smart-contracts/deployed-addresses.json');
    let addresses = {};
    
    if (fs.existsSync(addressesPath)) {
      addresses = fs.readJsonSync(addressesPath);
    }
    
    addresses[contractName] = deployedAddress;
    fs.writeJsonSync(addressesPath, addresses, { spaces: 2 });
    
    return {
      success: true,
      message: `合约已部署: ${contractName}`,
      address: deployedAddress,
      transactionHash: deployedContract.transactionHash
    };
  } catch (error) {
    logger.error(`部署合约失败: ${contractName}`, error);
    return {
      success: false,
      message: `部署合约失败: ${error.message}`
    };
  }
}

/**
 * 提交车辆数据到区块链
 * @param {Web3} web3 Web3实例
 * @param {Object} account 账户对象
 * @param {Array} vehicles 车辆数据数组
 * @returns {Promise<Object>} 提交结果
 */
async function submitVehicles(web3, account, vehicles) {
  try {
    // 获取车辆注册合约
    const vehicleRegistryContract = getContract(web3, 'VehicleRegistry');
    
    // 记录提交结果
    let submitted = 0;
    let failed = 0;
    const errors = [];
    const txHashes = [];
    
    // 逐个提交车辆数据
    for (const vehicle of vehicles) {
      try {
        // 准备提交参数
        const { vin, model, batteryCapacity } = vehicle;
        const batteryCapacityWei = web3.utils.toWei(batteryCapacity.toString(), 'ether'); // 转换为Wei单位
        
        // 调用合约方法
        logger.debug(`注册车辆: ${vin}`);
        
        const gas = await vehicleRegistryContract.methods.registerVehicle(
          vin,
          model,
          batteryCapacityWei
        ).estimateGas({ from: account.address });
        
        const receipt = await vehicleRegistryContract.methods.registerVehicle(
          vin,
          model,
          batteryCapacityWei
        ).send({
          from: account.address,
          gas
        });
        
        // 保存交易哈希
        txHashes.push(receipt.transactionHash);
        submitted++;
      } catch (error) {
        logger.error(`提交车辆数据失败: ${vehicle.vin}`, error);
        failed++;
        errors.push({
          vin: vehicle.vin,
          error: error.message
        });
      }
    }
    
    logger.info(`车辆数据提交完成: 成功 ${submitted}/${vehicles.length}, 失败 ${failed}`);
    
    return {
      success: submitted > 0,
      message: `提交车辆数据: 成功 ${submitted}/${vehicles.length}, 失败 ${failed}`,
      submitted,
      failed,
      errors: errors.length > 0 ? errors : null,
      transactionHashes: txHashes
    };
  } catch (error) {
    logger.error('提交车辆数据失败', error);
    return {
      success: false,
      message: `提交车辆数据失败: ${error.message}`
    };
  }
}

/**
 * 提交行驶数据到区块链
 * @param {Web3} web3 Web3实例
 * @param {Object} account 账户对象
 * @param {Array} drivingRecords 行驶记录数组
 * @returns {Promise<Object>} 提交结果
 */
async function submitDrivingData(web3, account, drivingRecords) {
  try {
    // 获取车辆注册合约
    const vehicleRegistryContract = getContract(web3, 'VehicleRegistry');
    
    // 记录提交结果
    let submitted = 0;
    let failed = 0;
    const errors = [];
    const txHashes = [];
    
    // 逐个提交行驶数据
    for (const record of drivingRecords) {
      try {
        // 准备提交参数
        const { vin, timestamp, mileage, energyConsumption } = record;
        
        // 转换为区块链数据格式
        const unixTimestamp = Math.floor(new Date(timestamp).getTime() / 1000);
        const mileageWei = web3.utils.toWei((mileage * 1000).toString(), 'ether'); // 转换为米，再转Wei
        const energyWei = web3.utils.toWei((energyConsumption * 1000).toString(), 'ether'); // 转换为Wh，再转Wei
        
        // 计算数据哈希
        const dataHash = web3.utils.soliditySha3(
          { type: 'string', value: vin },
          { type: 'uint256', value: unixTimestamp.toString() },
          { type: 'uint256', value: mileageWei.toString() },
          { type: 'uint256', value: energyWei.toString() }
        );
        
        // 调用合约方法
        logger.debug(`提交行驶数据: ${vin}, 时间: ${timestamp}`);
        
        const gas = await vehicleRegistryContract.methods.submitDrivingData(
          vin,
          unixTimestamp,
          mileageWei,
          energyWei,
          dataHash
        ).estimateGas({ from: account.address });
        
        const receipt = await vehicleRegistryContract.methods.submitDrivingData(
          vin,
          unixTimestamp,
          mileageWei,
          energyWei,
          dataHash
        ).send({
          from: account.address,
          gas
        });
        
        // 保存交易哈希
        txHashes.push(receipt.transactionHash);
        submitted++;
      } catch (error) {
        logger.error(`提交行驶数据失败: ${record.vin}, ${record.timestamp}`, error);
        failed++;
        errors.push({
          vin: record.vin,
          timestamp: record.timestamp,
          error: error.message
        });
      }
    }
    
    logger.info(`行驶数据提交完成: 成功 ${submitted}/${drivingRecords.length}, 失败 ${failed}`);
    
    return {
      success: submitted > 0,
      message: `提交行驶数据: 成功 ${submitted}/${drivingRecords.length}, 失败 ${failed}`,
      submitted,
      failed,
      errors: errors.length > 0 ? errors : null,
      transactionHashes: txHashes
    };
  } catch (error) {
    logger.error('提交行驶数据失败', error);
    return {
      success: false,
      message: `提交行驶数据失败: ${error.message}`
    };
  }
}

/**
 * 计算碳减排并生成碳积分
 * @param {Web3} web3 Web3实例
 * @param {Object} account 账户对象
 * @param {string} vin 车辆VIN码
 * @param {string} date 计算日期
 * @returns {Promise<Object>} 计算结果
 */
async function calculateCarbonReduction(web3, account, vin, date) {
  try {
    // 获取碳减排计算合约
    const calculatorContract = getContract(web3, 'CarbonCalculator');
    
    // 转换日期格式
    const startTime = Math.floor(new Date(date).setHours(0, 0, 0, 0) / 1000);
    const endTime = Math.floor(new Date(date).setHours(23, 59, 59, 999) / 1000);
    
    // 调用合约计算碳减排
    logger.debug(`计算碳减排: ${vin}, 日期: ${date}`);
    
    const gas = await calculatorContract.methods.calculateCarbonReduction(
      vin,
      startTime,
      startTime,
      endTime
    ).estimateGas({ from: account.address });
    
    const receipt = await calculatorContract.methods.calculateCarbonReduction(
      vin,
      startTime,
      startTime,
      endTime
    ).send({
      from: account.address,
      gas
    });
    
    // 获取计算ID
    const calculationId = receipt.events.CalculationCompleted.returnValues.calculationId;
    
    // 获取计算结果
    const result = await calculatorContract.methods.getCalculation(calculationId).call();
    
    // 生成碳积分
    logger.debug(`生成碳积分: ${vin}, 计算ID: ${calculationId}`);
    
    // 获取碳积分生成合约
    const creditsContract = getContract(web3, 'CreditsGenerator');
    
    const creditGas = await creditsContract.methods.generateCredits(calculationId).estimateGas({ 
      from: account.address 
    });
    
    const creditReceipt = await creditsContract.methods.generateCredits(calculationId).send({
      from: account.address,
      gas: creditGas
    });
    
    // 获取积分ID
    const creditId = creditReceipt.events.CreditsGenerated.returnValues.creditId;
    
    // 获取积分详情
    const creditDetails = await creditsContract.methods.getCreditRecord(creditId).call();
    
    return {
      success: true,
      message: `计算碳减排并生成积分完成: ${vin}, 日期: ${date}`,
      calculationId,
      carbonReduction: web3.utils.fromWei(result.carbonReduction, 'ether'),
      creditId,
      creditAmount: web3.utils.fromWei(creditDetails.amount, 'ether'),
      transactionHash: receipt.transactionHash,
      creditTransactionHash: creditReceipt.transactionHash
    };
  } catch (error) {
    logger.error(`计算碳减排失败: ${vin}, ${date}`, error);
    return {
      success: false,
      message: `计算碳减排失败: ${error.message}`
    };
  }
}

/**
 * 发放碳积分
 * @param {Web3} web3 Web3实例
 * @param {Object} account 账户对象
 * @param {string} creditId 积分ID
 * @returns {Promise<Object>} 发放结果
 */
async function issueCredits(web3, account, creditId) {
  try {
    // 获取积分管理合约
    const creditsManagerContract = getContract(web3, 'CreditsManager');
    
    // 调用合约发放积分
    logger.debug(`发放碳积分: ${creditId}`);
    
    const gas = await creditsManagerContract.methods.issueCredits(creditId).estimateGas({ 
      from: account.address 
    });
    
    const receipt = await creditsManagerContract.methods.issueCredits(creditId).send({
      from: account.address,
      gas
    });
    
    return {
      success: true,
      message: `积分发放成功: ${creditId}`,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    logger.error(`发放积分失败: ${creditId}`, error);
    return {
      success: false,
      message: `发放积分失败: ${error.message}`
    };
  }
}

/**
 * 获取车辆碳积分余额
 * @param {Web3} web3 Web3实例
 * @param {string} vin 车辆VIN码
 * @returns {Promise<Object>} 积分余额
 */
async function getVehicleCredits(web3, vin) {
  try {
    // 获取积分管理合约
    const creditsManagerContract = getContract(web3, 'CreditsManager');
    
    // 查询车辆积分余额
    const balance = await creditsManagerContract.methods.getVehicleBalance(vin).call();
    
    return {
      success: true,
      vin,
      balance: web3.utils.fromWei(balance, 'ether')
    };
  } catch (error) {
    logger.error(`获取车辆积分余额失败: ${vin}`, error);
    return {
      success: false,
      message: `获取车辆积分余额失败: ${error.message}`
    };
  }
}

/**
 * 查询区块链状态
 * @param {Web3} web3 Web3实例
 * @returns {Promise<Object>} 区块链状态
 */
async function getBlockchainStatus(web3) {
  try {
    // 获取最新区块号
    const blockNumber = await web3.eth.getBlockNumber();
    
    // 获取最新区块
    const latestBlock = await web3.eth.getBlock(blockNumber);
    
    // 获取网络ID
    const networkId = await web3.eth.net.getId();
    
    // 获取Gas价格
    const gasPrice = await web3.eth.getGasPrice();
    
    // 获取节点信息
    const nodeInfo = await web3.eth.getNodeInfo();
    
    return {
      success: true,
      blockNumber,
      latestBlockTime: new Date(latestBlock.timestamp * 1000).toISOString(),
      networkId,
      gasPrice: web3.utils.fromWei(gasPrice, 'gwei') + ' Gwei',
      nodeInfo
    };
  } catch (error) {
    logger.error('获取区块链状态失败', error);
    return {
      success: false,
      message: `获取区块链状态失败: ${error.message}`
    };
  }
}

/**
 * 监听区块链事件
 * @param {Web3} web3 Web3实例
 * @param {string} contractName 合约名称
 * @param {string} eventName 事件名称
 * @param {Function} callback 回调函数
 * @returns {Object} 事件订阅对象
 */
function subscribeToEvents(web3, contractName, eventName, callback) {
  try {
    // 获取合约实例
    const contract = getContract(web3, contractName);
    
    // 订阅事件
    logger.info(`正在订阅事件: ${contractName}.${eventName}`);
    
    const subscription = contract.events[eventName]({
      fromBlock: 'latest'
    }, function(error, event) {
      if (error) {
        logger.error(`事件订阅错误: ${contractName}.${eventName}`, error);
        return;
      }
      
      callback(event);
    });
    
    subscription.on('connected', function(subscriptionId) {
      logger.info(`事件订阅已连接: ${contractName}.${eventName}, ID: ${subscriptionId}`);
    });
    
    subscription.on('error', function(error) {
      logger.error(`事件订阅错误: ${contractName}.${eventName}`, error);
    });
    
    return subscription;
  } catch (error) {
    logger.error(`订阅事件失败: ${contractName}.${eventName}`, error);
    throw error;
  }
}

/**
 * 运行从命令行
 */
async function runFromCommandLine() {
  try {
    const options = program.opts();
    const operation = options.operation;
    
    // 创建Web3连接
    const web3 = createWeb3Connection();
    
    // 检查连接状态
    const status = await checkConnection(web3);
    if (!status.success) {
      logger.error('区块链连接失败:', status.message);
      process.exit(1);
    }
    
    // 获取账户
    const privateKey = config.global.integration.blockchain.privateKey;
    const account = await getAccount(web3, privateKey);
    
    // 根据操作执行对应功能
    let result;
    
    switch (operation) {
      case 'status':
        result = await getBlockchainStatus(web3);
        logger.info('区块链状态:', result);
        break;
        
      case 'deploy':
        if (!options.contract) {
          logger.error('缺少必要参数: --contract <name>');
          process.exit(1);
        }
        
        result = await deployContract(web3, account, options.contract);
        logger.info('合约部署结果:', result);
        break;
        
      case 'submit':
        if (!options.data) {
          logger.error('缺少必要参数: --data <file>');
          process.exit(1);
        }
        
        if (!fs.existsSync(options.data)) {
          logger.error(`数据文件不存在: ${options.data}`);
          process.exit(1);
        }
        
        const dataFile = options.data;
        const dataType = path.basename(dataFile, '.json');
        
        if (dataType.includes('vehicle')) {
          const vehicles = fs.readJsonSync(dataFile);
          result = await submitVehicles(web3, account, vehicles);
        } else if (dataType.includes('driving')) {
          const drivingRecords = fs.readJsonSync(dataFile);
          result = await submitDrivingData(web3, account, drivingRecords);
        } else {
          logger.error(`不支持的数据类型: ${dataType}`);
          process.exit(1);
        }
        
        logger.info('数据提交结果:', result);
        break;
        
      case 'calculate':
        if (!options.data) {
          logger.error('缺少必要参数: --data <vin,date>');
          process.exit(1);
        }
        
        const [vin, date] = options.data.split(',');
        result = await calculateCarbonReduction(web3, account, vin, date);
        logger.info('碳减排计算结果:', result);
        break;
        
      default:
        logger.error(`不支持的操作: ${operation}`);
        process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    logger.error('执行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件，执行命令行操作
if (require.main === module) {
  runFromCommandLine();
}

module.exports = {
  createWeb3Connection,
  checkConnection,
  getAccount,
  getContract,
  deployContract,
  submitVehicles,
  submitDrivingData,
  calculateCarbonReduction,
  issueCredits,
  getVehicleCredits,
  getBlockchainStatus,
  subscribeToEvents
};