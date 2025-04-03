package com.example.evcarbonmonitor.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface AnalyticsService {
    
    /**
     * 获取碳减排总览数据
     * @param startDate 开始日期 (yyyy-MM-dd)
     * @param endDate 结束日期 (yyyy-MM-dd)
     * @return 碳减排总览数据
     */
    Map<String, Object> getCarbonSummary(LocalDate startDate, LocalDate endDate);
    
    /**
     * 获取碳减排趋势数据
     * @param startDate 开始日期 (yyyy-MM-dd)
     * @param endDate 结束日期 (yyyy-MM-dd)
     * @param groupBy 分组方式（day/week/month）
     * @return 碳减排趋势数据 (包含 'timeline' 列表)
     */
    List<Map<String, Object>> getCarbonTrends(LocalDate startDate, LocalDate endDate, String groupBy);
    
    /**
     * 获取车型碳减排对比数据
     * @param startDate 开始日期 (yyyy-MM-dd)
     * @param endDate 结束日期 (yyyy-MM-dd)
     * @return 车型碳减排对比数据 (包含 'models' 列表)
     */
    List<Map<String, Object>> getCarbonByModel(LocalDate startDate, LocalDate endDate);
    
    /**
     * 获取车辆行驶数据
     * @param vin 车辆VIN码
     * @param startDate 开始日期时间
     * @param endDate 结束日期时间
     * @param metrics 指标列表
     * @return 车辆行驶数据
     */
    Map<String, Object> getDrivingData(String vin, LocalDateTime startDate, LocalDateTime endDate, List<String> metrics);
    
    /**
     * 获取预测数据
     * @param vin 车辆VIN码
     * @param period 预测周期（day/week/month）
     * @param count 预测数量
     * @return 预测数据
     */
    List<Map<String, Object>> getPredictions(String vin, String period, int count);
    
    /**
     * 获取热力图数据
     * @param date 日期时间
     * @param resolution 分辨率（hour/day）
     * @return 热力图数据
     */
    List<Map<String, Object>> getHeatmapData(LocalDateTime date, String resolution);
} 