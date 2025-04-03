// tools/data-generator/server.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs-extra');
const config = require('./config');
const logger = require('./utils/logger');
const { batchGeneration, streamGeneration } = require('./index');
const vehicleGenerator = require('./generators/vehicleGenerator');
const drivingGenerator = require('./generators/drivingGenerator');
const carbonGenerator = require('./generators/carbonGenerator');
const blockchainGenerator = require('./generators/blockchainGenerator');
const fileUtils = require('./utils/fileUtils');

// 创建Express应用
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'ui')));

// 实时数据生成状态
let isGenerating = false;
let generationInterval = null;
let generationStats = {
  startTime: null,
  recordsGenerated: {
    vehicles: 0,
    driving: 0,
    carbon: 0,
    blockchain: {
      blocks: 0,
      transactions: 0
    }
  }
};

// Socket连接
io.on('connection', (socket) => {
  logger.info('客户端已连接', socket.id);
  
  // 发送当前状态
  socket.emit('status', {
    isGenerating,
    stats: generationStats
  });
  
  // 处理开始生成请求
  socket.on('start-generation', async (params) => {
    if (isGenerating) {
      socket.emit('error', '已有数据生成过程正在进行');
      return;
    }
    
    try {
      isGenerating = true;
      generationStats = {
        startTime: new Date().toISOString(),
        recordsGenerated: {
          vehicles: 0,
          driving: 0,
          carbon: 0,
          blockchain: {
            blocks: 0,
            transactions: 0
          }
        }
      };
      
      // 通知所有客户端生成已开始
      io.emit('generation-started', generationStats);
      
      // 根据模式生成数据
      if (params.mode === 'batch') {
        // 批量生成模式
        const result = await batchGeneration();
        
        // 更新统计
        generationStats.recordsGenerated = {
          vehicles: result.vehicleCount,
          driving: result.drivingRecordCount,
          carbon: result.carbonRecordCount,
          blockchain: {
            blocks: result.blockCount,
            transactions: result.transactionCount
          }
        };
        
        // 通知所有客户端生成完成
        io.emit('generation-completed', generationStats);
      } else {
        // 流式生成模式
        const intervalMs = params.interval || 60000; // 默认每分钟
        
        // 首次生成
        const vehicles = await vehicleGenerator.generateVehicles(params.vehicleCount);
        generationStats.recordsGenerated.vehicles = vehicles.length;
        
        // 设置定时任务
        generationInterval = setInterval(async () => {
          try {
            // 生成新数据
            const drivingBatch = await drivingGenerator.generateRealtimeDrivingData(vehicles);
            const carbonBatch = await carbonGenerator.generateRealtimeCarbonData(vehicles, drivingBatch);
            const blockchainBatch = await blockchainGenerator.generateRealtimeBlockchainData(drivingBatch, carbonBatch);
            
            // 更新统计
            generationStats.recordsGenerated.driving += drivingBatch.length;
            generationStats.recordsGenerated.carbon += carbonBatch.records.length;
            generationStats.recordsGenerated.blockchain.blocks += blockchainBatch.blocks.length;
            generationStats.recordsGenerated.blockchain.transactions += blockchainBatch.transactions.length;
            
            // 通知所有客户端新数据
            io.emit('data-generated', {
              timestamp: new Date().toISOString(),
              batchSize: {
                driving: drivingBatch.length,
                carbon: carbonBatch.records.length,
                blockchain: {
                  blocks: blockchainBatch.blocks.length,
                  transactions: blockchainBatch.transactions.length
                }
              },
              stats: generationStats
            });
          } catch (error) {
            logger.error('生成数据批次出错:', error);
            io.emit('error', `生成数据批次出错: ${error.message}`);
          }
        }, intervalMs);
        
        // 通知所有客户端流式生成已开始
        io.emit('stream-generation-started', {
          interval: intervalMs,
          stats: generationStats
        });
      }
    } catch (error) {
      logger.error('开始生成数据出错:', error);
      isGenerating = false;
      io.emit('error', `开始生成数据出错: ${error.message}`);
    }
  });
  
  // 处理停止生成请求
  socket.on('stop-generation', () => {
    if (!isGenerating) {
      socket.emit('error', '没有正在进行的数据生成过程');
      return;
    }
    
    // 清除定时任务
    if (generationInterval) {
      clearInterval(generationInterval);
      generationInterval = null;
    }
    
    isGenerating = false;
    
    // 通知所有客户端生成已停止
    io.emit('generation-stopped', generationStats);
  });
  
  // 处理重置请求
  socket.on('reset-data', async () => {
    try {
      // 确保没有生成过程在运行
      if (isGenerating) {
        socket.emit('error', '请先停止数据生成过程');
        return;
      }
      
      // 清空输出目录
      fileUtils.cleanDirectory();
      
      // 通知所有客户端重置完成
      io.emit('data-reset');
    } catch (error) {
      logger.error('重置数据出错:', error);
      socket.emit('error', `重置数据出错: ${error.message}`);
    }
  });
  
  // 断开连接
  socket.on('disconnect', () => {
    logger.info('客户端已断开连接', socket.id);
  });
});

// API路由
// 获取配置
app.get('/api/config', (req, res) => {
  // 返回敏感信息过滤后的配置
  const filteredConfig = { ...config };
  
  // 过滤掉敏感信息
  if (filteredConfig.global && filteredConfig.global.integration) {
    if (filteredConfig.global.integration.database) {
      delete filteredConfig.global.integration.database.password;
    }
    if (filteredConfig.global.integration.blockchain) {
      delete filteredConfig.global.integration.blockchain.privateKey;
    }
  }
  
  res.json(filteredConfig);
});

// 更新配置
app.post('/api/config', (req, res) => {
  try {
    // 更新配置（部分更新）
    Object.assign(config, req.body);
    
    res.json({ success: true, message: '配置已更新' });
  } catch (error) {
    logger.error('更新配置出错:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取生成状态
app.get('/api/status', (req, res) => {
  res.json({
    isGenerating,
    stats: generationStats
  });
});

// 获取已生成数据统计
app.get('/api/stats', (req, res) => {
  try {
    // 读取输出目录中的stats.json
    const statsPath = path.join(config.global.outputDir, 'stats.json');
    
    if (fs.existsSync(statsPath)) {
      const stats = fs.readJsonSync(statsPath);
      res.json(stats);
    } else {
      res.json({
        generatedAt: null,
        vehicleCount: 0,
        drivingRecordCount: 0,
        carbonRecordCount: 0,
        totalCarbonReduction: 0,
        totalCredits: 0,
        blockCount: 0,
        transactionCount: 0
      });
    }
  } catch (error) {
    logger.error('获取统计数据出错:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取车辆数据
app.get('/api/data/vehicles', (req, res) => {
  try {
    const vehiclesPath = path.join(config.global.outputDir, 'vehicles.json');
    
    if (fs.existsSync(vehiclesPath)) {
      const vehicles = fs.readJsonSync(vehiclesPath);
      res.json(vehicles);
    } else {
      res.status(404).json({ success: false, message: '车辆数据未生成' });
    }
  } catch (error) {
    logger.error('获取车辆数据出错:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取数据文件列表
app.get('/api/files', (req, res) => {
  try {
    const files = fs.readdirSync(config.global.outputDir)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(config.global.outputDir, file);
        const stats = fs.statSync(filePath);
        
        return {
          name: file,
          size: stats.size,
          lastModified: stats.mtime
        };
      });
    
    res.json(files);
  } catch (error) {
    logger.error('获取文件列表出错:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 下载数据文件
app.get('/api/files/:filename', (req, res) => {
  try {
    const filePath = path.join(config.global.outputDir, req.params.filename);
    
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).json({ success: false, message: '文件不存在' });
    }
  } catch (error) {
    logger.error('下载文件出错:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 主页
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

// 启动服务器
const port = config.server.port || 3000;
const host = config.server.host || 'localhost';

server.listen(port, host, () => {
  logger.info(`数据模拟器控制面板已启动: http://${host}:${port}`);
});

// 处理进程终止信号
process.on('SIGINT', () => {
  logger.info('接收到中断信号，正在关闭服务器...');
  
  // 清除定时任务
  if (generationInterval) {
    clearInterval(generationInterval);
  }
  
  // 关闭服务器
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });
});