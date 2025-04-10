package com.example.evcarbonmonitor.repository;

import com.example.evcarbonmonitor.domain.CarbonEmission;
import com.example.evcarbonmonitor.domain.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;

@Repository
public interface CarbonEmissionRepository extends JpaRepository<CarbonEmission, Long> {
    
    List<CarbonEmission> findByVehicleOrderByCalculationTimeDesc(Vehicle vehicle);
    
    List<CarbonEmission> findByVehicleAndCalculationTimeBetweenOrderByCalculationTimeDesc(
        Vehicle vehicle, LocalDateTime startTime, LocalDateTime endTime);
    
    @Query("SELECT SUM(ce.carbonReduction) FROM CarbonEmission ce WHERE ce.vehicle = ?1")
    Double getTotalCarbonReductionByVehicle(Vehicle vehicle);
    
    @Query("SELECT SUM(ce.carbonReduction) FROM CarbonEmission ce WHERE ce.vehicle = :vehicle AND ce.calculationTime >= :startTime AND ce.calculationTime < :endTime")
    Double getCarbonReductionByVehicleAndTimeRange(@Param("vehicle") Vehicle vehicle, 
                                                 @Param("startTime") LocalDateTime startTime, 
                                                 @Param("endTime") LocalDateTime endTime);

    /**
     * Calculates the total carbon reduction across all vehicles within a specific time range.
     */
    @Query("SELECT SUM(ce.carbonReduction) FROM CarbonEmission ce WHERE ce.calculationTime >= :startTime AND ce.calculationTime < :endTime")
    Double getTotalReductionByTimeRange(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * Calculates carbon reduction trends grouped by day.
     * Returns a list of maps, each containing 'date' (LocalDate) and 'reduction' (Double).
     */
    @Query("SELECT FUNCTION('DATE', ce.calculationTime) as calculationDate, SUM(ce.carbonReduction) as dailyReduction " +
           "FROM CarbonEmission ce WHERE ce.calculationTime >= :startTime AND ce.calculationTime < :endTime " +
           "GROUP BY calculationDate ORDER BY calculationDate ASC")
    List<Map<String, Object>> getReductionTrendsByDay(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
    
    // Note: Grouping by week/month in standard JPQL can be complex depending on DB specifics.
    // Consider native queries if precise week/month grouping (respecting year boundaries) is needed.
    // Example for month (might need adjustments based on DB function support):
    @Query("SELECT FUNCTION('DATE_PART', 'year', ce.calculationTime) as year, FUNCTION('DATE_PART', 'month', ce.calculationTime) as month, SUM(ce.carbonReduction) as monthlyReduction " +
           "FROM CarbonEmission ce WHERE ce.calculationTime >= :startTime AND ce.calculationTime < :endTime " +
           "GROUP BY year, month ORDER BY year ASC, month ASC")
    List<Map<String, Object>> getReductionTrendsByMonth(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * Calculates carbon reduction totals and vehicle counts grouped by vehicle model.
     * Returns a list of maps, each containing 'model' (String), 'reduction' (Double), and 'vehicleCount' (Long).
     */
     @Query("SELECT ce.vehicle.model as model, SUM(ce.carbonReduction) as totalReduction, COUNT(DISTINCT ce.vehicle.vin) as vehicleCount " +
           "FROM CarbonEmission ce WHERE ce.calculationTime >= :startTime AND ce.calculationTime < :endTime " +
           "GROUP BY ce.vehicle.model")
    List<Map<String, Object>> getReductionByModel(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * Finds data points (latitude, longitude, carbonReduction) for heatmap generation
     * within a specific time range, filtering out records with null coordinates.
     */
    @Query("SELECT ce.latitude as lat, ce.longitude as lng, ce.carbonReduction as count " +
           "FROM CarbonEmission ce " +
           "WHERE ce.calculationTime >= :startTime AND ce.calculationTime < :endTime " +
           "AND ce.latitude IS NOT NULL AND ce.longitude IS NOT NULL")
    List<Map<String, Object>> findHeatmapDataPoints(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 定义一个投影接口，用于接收按天聚合的结果。
     * 字段名需要与 JPQL 查询中的 AS 别名匹配。
     */
    public interface DailyDrivingAggregate {
        LocalDate getCalculationDate();
        Double getTotalDistance();
        Double getTotalEnergyConsumption();
        Double getTotalCarbonReduction();
    }

    /**
     * 按天聚合指定车辆在时间范围内的行驶数据。
     * @param vehicle 车辆实体
     * @param startDateTime 开始时间
     * @param endDateTime 结束时间 (exclusive)
     * @return 按天聚合的数据列表
     */
    @Query("SELECT DATE(c.calculationTime) as calculationDate, " +
           "SUM(c.distance) as totalDistance, " +
           "SUM(c.energyConsumption) as totalEnergyConsumption, " +
           "SUM(c.carbonReduction) as totalCarbonReduction " +
           "FROM CarbonEmission c " +
           "WHERE c.vehicle = :vehicle " +
           "AND c.calculationTime >= :startDateTime AND c.calculationTime < :endDateTime " +
           "GROUP BY DATE(c.calculationTime) " +
           "ORDER BY calculationDate ASC")
    List<DailyDrivingAggregate> findDailyDrivingAggregatesByVehicleAndTimeRange(
            @Param("vehicle") Vehicle vehicle,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime);


    /**
     * 查询指定车辆在时间范围内的位置和碳减排数据，用于热力图。
     * 仅包含有有效经纬度的数据。
     * @param vehicle 车辆实体
     * @param startDateTime 开始时间
     * @param endDateTime 结束时间 (exclusive)
     * @return 包含经度、纬度、碳减排量的对象列表 (Object[] {longitude, latitude, carbonReduction})
     */
    @Query("SELECT c.longitude, c.latitude, c.carbonReduction " +
           "FROM CarbonEmission c " +
           "WHERE c.vehicle = :vehicle " +
           "AND c.calculationTime >= :startDateTime AND c.calculationTime < :endDateTime " +
           "AND c.latitude IS NOT NULL AND c.longitude IS NOT NULL")
    List<Object[]> findLocationAndReductionByVehicleAndTimeRange(
            @Param("vehicle") Vehicle vehicle,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime);
} 