// tools/data-generator/utils/dateUtils.js
const moment = require('moment');
const config = require('../config');
const randomUtils = require('./randomUtils');

/**
 * 获取配置的时间范围
 * @returns {Object} 开始和结束时间的moment对象
 */
function getTimeRange() {
  const start = moment(config.global.timeRange.start);
  const end = moment(config.global.timeRange.end);
  
  return { start, end };
}

/**
 * 生成指定范围内的随机日期
 * @param {string|Date} start 开始日期
 * @param {string|Date} end 结束日期
 * @returns {moment.Moment} 随机日期
 */
function getRandomDate(start, end) {
  const startDate = start ? moment(start) : moment(config.global.timeRange.start);
  const endDate = end ? moment(end) : moment(config.global.timeRange.end);
  
  const startTimestamp = startDate.valueOf();
  const endTimestamp = endDate.valueOf();
  
  const randomTimestamp = randomUtils.getRandomNumber(startTimestamp, endTimestamp, false);
  
  return moment(randomTimestamp);
}

/**
 * 获取指定日期所在季节
 * @param {string|Date|moment.Moment} date 日期
 * @returns {string} 季节 (spring/summer/autumn/winter)
 */
function getSeason(date) {
  const month = moment(date).month(); // 0-11
  
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

/**
 * 判断指定日期是否为工作日（周一至周五）
 * @param {string|Date|moment.Moment} date 日期
 * @returns {boolean} 是否为工作日
 */
function isWorkday(date) {
  const day = moment(date).day(); // 0-6，0是周日
  return day >= 1 && day <= 5;
}

/**
 * 生成日期时间序列
 * @param {string|Date} start 开始日期
 * @param {string|Date} end 结束日期
 * @param {string} unit 间隔单位 (minutes/hours/days/weeks/months)
 * @param {number} step 步长
 * @returns {Array<moment.Moment>} 日期时间序列
 */
function generateDateSeries(start, end, unit = 'days', step = 1) {
  const startDate = moment(start);
  const endDate = moment(end);
  const result = [];
  
  let current = startDate.clone();
  while (current.isSameOrBefore(endDate)) {
    result.push(current.clone());
    current.add(step, unit);
  }
  
  return result;
}

/**
 * 生成日时间序列（只包含特定时间段）
 * @param {string|Date} start 开始日期
 * @param {string|Date} end 结束日期
 * @param {Object} timeRanges 时间范围配置
 * @param {string} unit 间隔单位 (minutes/hours)
 * @param {number} step 步长
 * @returns {Array<moment.Moment>} 日期时间序列
 */
function generateTimeSeries(start, end, timeRanges, unit = 'hours', step = 1) {
  // timeRanges格式: { workday: [["08:00", "09:30"], ["17:30", "19:00"]], weekend: [["10:00", "18:00"]] }
  
  const startDate = moment(start).startOf('day');
  const endDate = moment(end).endOf('day');
  const result = [];
  
  let current = startDate.clone();
  while (current.isSameOrBefore(endDate)) {
    const isWeekend = !isWorkday(current);
    const dailyRanges = isWeekend ? timeRanges.weekend : timeRanges.workday;
    
    if (dailyRanges && dailyRanges.length > 0) {
      for (const [rangeStart, rangeEnd] of dailyRanges) {
        const [startHour, startMinute] = rangeStart.split(':').map(Number);
        const [endHour, endMinute] = rangeEnd.split(':').map(Number);
        
        const timeStart = current.clone().hour(startHour).minute(startMinute);
        const timeEnd = current.clone().hour(endHour).minute(endMinute);
        
        let timeCurrent = timeStart.clone();
        while (timeCurrent.isSameOrBefore(timeEnd)) {
          result.push(timeCurrent.clone());
          timeCurrent.add(step, unit);
        }
      }
    }
    
    current.add(1, 'days');
  }
  
  return result;
}

/**
 * 获取两个日期之间的天数
 * @param {string|Date|moment.Moment} start 开始日期
 * @param {string|Date|moment.Moment} end 结束日期
 * @returns {number} 天数
 */
function getDaysBetween(start, end) {
  return moment(end).diff(moment(start), 'days');
}

/**
 * 格式化日期时间
 * @param {string|Date|moment.Moment} date 日期
 * @param {string} format 格式
 * @returns {string} 格式化后的日期
 */
function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  return moment(date).format(format);
}

/**
 * 判断某个时间段是否处于高峰期（早高峰或晚高峰）
 * @param {string|Date|moment.Moment} time 时间
 * @returns {boolean} 是否为高峰期
 */
function isPeakHour(time) {
  const hour = moment(time).hour();
  return (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
}

/**
 * 为指定日期添加随机时间偏移
 * @param {string|Date|moment.Moment} date 日期
 * @param {Object} options 偏移选项
 * @param {number} options.maxHours 最大小时偏移
 * @param {number} options.maxMinutes 最大分钟偏移
 * @returns {moment.Moment} 偏移后的日期
 */
function addRandomOffset(date, options = {}) {
  const { maxHours = 2, maxMinutes = 59 } = options;
  
  const hourOffset = randomUtils.getRandomNumber(-maxHours, maxHours);
  const minuteOffset = randomUtils.getRandomNumber(-maxMinutes, maxMinutes);
  
  return moment(date).add(hourOffset, 'hours').add(minuteOffset, 'minutes');
}

module.exports = {
  getTimeRange,
  getRandomDate,
  getSeason,
  isWorkday,
  generateDateSeries,
  generateTimeSeries,
  getDaysBetween,
  formatDate,
  isPeakHour,
  addRandomOffset
};