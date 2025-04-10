package com.example.evcarbonmonitor.service;

import com.example.evcarbonmonitor.dto.DrivingData;
import com.example.evcarbonmonitor.dto.DrivingTimeSeriesPoint;
import com.example.evcarbonmonitor.dto.HeatmapDataPoint;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

// Placeholder DTO definitions (should be separate files ideally)
/*
@Data @NoArgsConstructor @AllArgsConstructor
class DrivingData { BigDecimal totalMileage; BigDecimal totalEnergy; BigDecimal totalCarbonReduction; BigDecimal averageEfficiency; }
@Data @NoArgsConstructor @AllArgsConstructor
class DrivingTimeSeriesPoint { String date; BigDecimal mileage; BigDecimal energy; BigDecimal carbonReduction; BigDecimal efficiency; }
@Data @NoArgsConstructor @AllArgsConstructor
class HeatmapDataPoint { double lat; double lng; double count; } // Assuming count is double for flexibility
*/

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
     * 获取车辆的汇总行驶统计数据
     * @param vin 车辆VIN码
     * @param startDate 开始日期 (inclusive)
     * @param endDate 结束日期 (inclusive)
     * @return 汇总行驶数据 (DrivingData DTO)
     */
    DrivingData getDrivingDataSummary(String vin, LocalDate startDate, LocalDate endDate);
    
    /**
     * 获取车辆的行驶时间序列数据
     * @param vin 车辆VIN码
     * @param startDate 开始日期 (inclusive)
     * @param endDate 结束日期 (inclusive)
     * @param groupBy 分组方式 ('day', 'week', 'month')
     * @return 时间序列数据列表 (List of DrivingTimeSeriesPoint DTO)
     */
    List<DrivingTimeSeriesPoint> getDrivingTimeSeries(String vin, LocalDate startDate, LocalDate endDate, String groupBy);
    
    /**
     * 获取车辆的活动热力图数据
     * @param vin 车辆VIN码
     * @param startDate 开始日期 (inclusive)
     * @param endDate 结束日期 (inclusive)
     * @param valueType 热力图值的类型 ('frequency', 'duration', 'carbonReduction')
     * @return 热力图数据点列表 (List of HeatmapDataPoint DTO)
     */
    List<HeatmapDataPoint> getVehicleHeatmapData(String vin, LocalDate startDate, LocalDate endDate, String valueType);
    
    /**
     * 获取预测数据
     * @param vin 车辆VIN码
     * @param period 预测周期（day/week/month）
     * @param count 预测数量
     * @return 预测数据
     */
    List<Map<String, Object>> getPredictions(String vin, String period, int count);

    // Kept original getDrivingData signature marked as deprecated
    @Deprecated
    Map<String, Object> getDrivingData(String vin, LocalDateTime startDate, LocalDateTime endDate, List<String> metrics);
} 