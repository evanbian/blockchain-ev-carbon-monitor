// tools/data-generator/config.js
require('dotenv').config();

/**
 * 数据模拟器配置
 */
module.exports = {
  // 全局设置
  global: {
    // 随机种子，用于生成可重复的随机数据
    seed: process.env.RANDOM_SEED || 'ev-carbon-2023',
    // 默认输出目录
    outputDir: process.env.OUTPUT_DIR || './output',
    // 默认数据生成模式：batch(批量) 或 stream(流式)
    mode: process.env.GENERATION_MODE || 'batch',
    // 生成数据的时间范围
    timeRange: {
      start: process.env.TIME_RANGE_START || '2023-01-01',
      end: process.env.TIME_RANGE_END || '2023-07-01'
    },
    // 系统集成设置
    integration: {
      // 数据导出目标: file, database, api, blockchain
      target: (process.env.EXPORT_TARGET || 'file').split(','),
      // API基础URL
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8080/api/v1',
      // 数据库连接信息
      database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'evcarbonmonitor',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password'
      },
      // 区块链连接信息
      blockchain: {
        provider: process.env.BLOCKCHAIN_PROVIDER || 'http://localhost:8545',
        privateKey: process.env.PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000'
      }
    }
  },

  // 车辆数据生成配置
  vehicle: {
    // 生成车辆数量
    count: parseInt(process.env.VEHICLE_COUNT || '15'),
    // 车型分布(百分比)
    models: {
      '比亚迪汉EV': 30,
      '特斯拉Model 3': 25,
      '蔚来ES6': 15,
      '小鹏P7': 15,
      '理想ONE': 15
    },
    // 制造商映射
    manufacturers: {
      '比亚迪汉EV': '比亚迪',
      '特斯拉Model 3': '特斯拉',
      '蔚来ES6': '蔚来',
      '小鹏P7': '小鹏',
      '理想ONE': '理想'
    },
    // 电池容量设置(kWh)
    batteryCapacity: {
      '比亚迪汉EV': 76.9,
      '特斯拉Model 3': 60.0,
      '蔚来ES6': 70.0,
      '小鹏P7': 80.7,
      '理想ONE': 40.5  // 增程式
    },
    // 最大续航里程(km)
    maxRange: {
      '比亚迪汉EV': 605,
      '特斯拉Model 3': 550,
      '蔚来ES6': 510,
      '小鹏P7': 600,
      '理想ONE': 180  // 纯电续航
    },
    // 车辆状态分布(百分比)
    status: {
      'online': 80,
      'offline': 15,
      'error': 5
    },
    // 生产年份范围
    productionYear: {
      min: 2021,
      max: 2023
    }
  },

  // 行驶数据生成配置
  driving: {
    // 日均行驶里程范围(km)
    dailyMileage: {
      min: 20,
      max: 100,
      // 行驶模式分布(百分比)
      patterns: {
        'commute': 70,   // 通勤模式
        'leisure': 20,   // 休闲模式
        'long-distance': 10  // 长途模式
      }
    },
    // 能耗系数(kWh/100km)，根据车型和季节调整
    energyConsumption: {
      'base': {
        '比亚迪汉EV': 15.2,
        '特斯拉Model 3': 13.8,
        '蔚来ES6': 16.5,
        '小鹏P7': 15.0,
        '理想ONE': 18.0  // 增程式通常能耗较高
      },
      // 季节调整系数
      'seasonAdjustment': {
        'spring': 1.0,
        'summer': 1.15,  // 夏季空调增加能耗
        'autumn': 1.0,
        'winter': 1.25   // 冬季暖空调增加能耗
      },
      // 驾驶模式调整系数
      'patternAdjustment': {
        'commute': 1.0,
        'leisure': 0.9,  // 休闲驾驶通常更节能
        'long-distance': 0.85  // 长途驾驶速度稳定，更节能
      }
    },
    // 数据记录频率(分钟)
    recordFrequency: 15,
    // 异常数据生成概率(百分比)
    anomalyRate: 5
  },

  // 碳减排计算配置
  carbon: {
    // 电网排放因子(kg CO2/kWh)，基于中国区域电网平均值
    gridEmissionFactor: 0.8547,
    // 传统燃油车排放因子(kg CO2/km)
    traditionalVehicleEmission: 0.196,
    // 碳积分转换系数(每减排1kg CO2可获得的碳积分)
    creditsConversionRate: 0.05
  },

  // 区块链数据生成配置
  blockchain: {
    // 区块生成间隔(秒)
    blockInterval: 12,
    // 初始区块高度
    initialBlockHeight: 10000,
    // 交易类型分布(百分比)
    transactionTypes: {
      'vehicleRegister': 5,
      'dataUpload': 60,
      'creditsGenerate': 25,
      'creditsTransfer': 10
    },
    // 燃料费用范围(wei)
    gas: {
      min: 21000,
      max: 100000
    },
    // 燃料价格范围(wei)
    gasPrice: {
      min: 1000000000,  // 1 gwei
      max: 3000000000   // 3 gwei
    }
  },

  // 控制面板服务器配置
  server: {
    port: parseInt(process.env.SERVER_PORT || '3000'),
    host: process.env.SERVER_HOST || 'localhost'
  }
};