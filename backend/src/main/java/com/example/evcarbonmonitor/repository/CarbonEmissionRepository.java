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
} 