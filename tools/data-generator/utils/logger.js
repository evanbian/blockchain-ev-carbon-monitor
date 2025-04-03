// tools/data-generator/utils/logger.js
const winston = require('winston');
const path = require('path');
const fs = require('fs-extra');

// 确保日志目录存在
const logDir = path.join(__dirname, '../logs');
fs.ensureDirSync(logDir);

// 创建日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(
    ({ level, message, timestamp, stack }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}${stack ? `\n${stack}` : ''}`;
    }
  )
);

// 创建logger实例
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'data-generator' },
  transports: [
    // 控制台日志
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    // 文件日志 - 错误级别
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'),
      level: 'error'
    }),
    // 文件日志 - 所有级别
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log')
    })
  ]
});

// 开发环境下额外配置
if (process.env.NODE_ENV !== 'production') {
  logger.level = 'debug';
}

module.exports = logger;