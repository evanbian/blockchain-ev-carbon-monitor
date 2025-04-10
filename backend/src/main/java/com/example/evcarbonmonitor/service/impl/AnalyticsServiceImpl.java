package com.example.evcarbonmonitor.service.impl;

import com.example.evcarbonmonitor.domain.CarbonEmission;
import com.example.evcarbonmonitor.domain.Vehicle;
import com.example.evcarbonmonitor.dto.DrivingData;
import com.example.evcarbonmonitor.dto.DrivingTimeSeriesPoint;
import com.example.evcarbonmonitor.dto.HeatmapDataPoint;
import com.example.evcarbonmonitor.exception.ResourceNotFoundException;
import com.example.evcarbonmonitor.repository.CarbonEmissionRepository;
import com.example.evcarbonmonitor.repository.VehicleRepository;
import com.example.evcarbonmonitor.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsServiceImpl.class);

    // Define constants for calculation factors
    private static final double KG_CO2_PER_LITER_FUEL = 2.3;
    private static final double KG_CO2_ABSORBED_PER_TREE_YEAR = 20.0;
    private static final double CREDITS_PER_KG_CO2_REDUCTION = 0.05;
    // TODO: Make this price configurable (e.g., via application properties)
    private static final BigDecimal PRICE_PER_KG_CO2 = new BigDecimal("0.50"); // Example price: 0.50 元/kg
    // Scale for BigDecimal calculations
    private static final int CALCULATION_SCALE = 4;
    private static final RoundingMode ROUNDING_MODE = RoundingMode.HALF_UP;
    // Define history lookback period for prediction
    private static final int PREDICTION_HISTORY_DAYS = 30;

    private final CarbonEmissionRepository carbonEmissionRepository;
    private final VehicleRepository vehicleRepository;

    @Override
    public Map<String, Object> getCarbonSummary(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        Map<String, Object> summary = new HashMap<>();

        // Use new repository method for total reduction
        Double totalReductionDouble = carbonEmissionRepository.getTotalReductionByTimeRange(startDateTime, endDateTime);
        double totalReduction = totalReductionDouble != null ? totalReductionDouble : 0.0;
        BigDecimal totalReductionBd = BigDecimal.valueOf(totalReduction);

        // Calculate equivalent fuel reduction (renamed to comparedToFuel)
        BigDecimal comparedToFuel = totalReductionBd.divide(BigDecimal.valueOf(KG_CO2_PER_LITER_FUEL), CALCULATION_SCALE, ROUNDING_MODE);

        // Calculate equivalent trees planted
        long daysInRange = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        BigDecimal daysFactor = BigDecimal.valueOf(daysInRange).divide(BigDecimal.valueOf(365.0), CALCULATION_SCALE, ROUNDING_MODE);
        BigDecimal equivalentTrees = totalReductionBd.divide(BigDecimal.valueOf(KG_CO2_ABSORBED_PER_TREE_YEAR), CALCULATION_SCALE, ROUNDING_MODE)
                                                .multiply(daysFactor);

        // Calculate economic value using the defined price
        BigDecimal economicValue = totalReductionBd.multiply(PRICE_PER_KG_CO2);

        // Get vehicle count separately (still requires a query, but only one)
        long vehicleCount = vehicleRepository.count(); // Efficiently count vehicles

        summary.put("totalReduction", totalReductionBd.setScale(2, ROUNDING_MODE)); // Format output
        summary.put("comparedToFuel", comparedToFuel.setScale(2, ROUNDING_MODE));
        summary.put("economicValue", economicValue.setScale(2, ROUNDING_MODE));
        summary.put("equivalentTrees", equivalentTrees.setScale(0, RoundingMode.HALF_UP)); // Round trees
        summary.put("vehicleCount", vehicleCount);

        return summary;
    }

    @Override
    public List<Map<String, Object>> getCarbonTrends(LocalDate startDate, LocalDate endDate, String groupBy) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        List<Map<String, Object>> trendsData;
        switch (groupBy.toLowerCase()) {
            case "day":
                trendsData = carbonEmissionRepository.getReductionTrendsByDay(startDateTime, endDateTime);
                // Post-process to match expected format: date (LocalDate), reduction (Double), credits (Double)
                return trendsData.stream().map(item -> {
                    Map<String, Object> processedItem = new HashMap<>();
                    // Handle potential date type from DB (e.g., java.sql.Date)
                    LocalDate date = ((Date) item.get("calculationDate")).toLocalDate();
                    double reduction = ((Number) item.getOrDefault("dailyReduction", 0.0)).doubleValue();
                    BigDecimal reductionBd = BigDecimal.valueOf(reduction);
                    BigDecimal credits = reductionBd.multiply(BigDecimal.valueOf(CREDITS_PER_KG_CO2_REDUCTION));
                    
                    processedItem.put("date", date); 
                    processedItem.put("reduction", reductionBd.setScale(2, ROUNDING_MODE));
                    processedItem.put("credits", credits.setScale(2, ROUNDING_MODE));
                    return processedItem;
                }).collect(Collectors.toList());

            case "month":
                 trendsData = carbonEmissionRepository.getReductionTrendsByMonth(startDateTime, endDateTime);
                 // Post-process month data: date (LocalDate - first day of month), reduction, credits
                 return trendsData.stream().map(item -> {
                    Map<String, Object> processedItem = new HashMap<>();
                    int year = ((Number) item.get("year")).intValue();
                    int month = ((Number) item.get("month")).intValue();
                    LocalDate date = YearMonth.of(year, month).atDay(1);
                    double reduction = ((Number) item.getOrDefault("monthlyReduction", 0.0)).doubleValue();
                    BigDecimal reductionBd = BigDecimal.valueOf(reduction);
                    BigDecimal credits = reductionBd.multiply(BigDecimal.valueOf(CREDITS_PER_KG_CO2_REDUCTION));

                    processedItem.put("date", date);
                    processedItem.put("reduction", reductionBd.setScale(2, ROUNDING_MODE));
                    processedItem.put("credits", credits.setScale(2, ROUNDING_MODE));
                    return processedItem;
                 }).collect(Collectors.toList());
            
            case "week":
                // TODO: Implement weekly trends if needed, likely requires native query
                // Fall through to default (or throw exception)
                // For now, returning empty or potentially daily data as fallback
                // Fallthrough to daily as default for now
            default: // Default to daily if groupBy is invalid or 'week'
                trendsData = carbonEmissionRepository.getReductionTrendsByDay(startDateTime, endDateTime);
                return trendsData.stream().map(item -> {
                    Map<String, Object> processedItem = new HashMap<>();
                    LocalDate date = ((Date) item.get("calculationDate")).toLocalDate();
                    double reduction = ((Number) item.getOrDefault("dailyReduction", 0.0)).doubleValue();
                    BigDecimal reductionBd = BigDecimal.valueOf(reduction);
                    BigDecimal credits = reductionBd.multiply(BigDecimal.valueOf(CREDITS_PER_KG_CO2_REDUCTION));
                    
                    processedItem.put("date", date); 
                    processedItem.put("reduction", reductionBd.setScale(2, ROUNDING_MODE));
                    processedItem.put("credits", credits.setScale(2, ROUNDING_MODE));
                    return processedItem;
                }).collect(Collectors.toList());
        }
    }

    @Override
    public List<Map<String, Object>> getCarbonByModel(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        // Use new repository method
        List<Map<String, Object>> rawModelData = carbonEmissionRepository.getReductionByModel(startDateTime, endDateTime);

        // Calculate grand total reduction needed for percentage
        Double grandTotalReductionDouble = carbonEmissionRepository.getTotalReductionByTimeRange(startDateTime, endDateTime);
        BigDecimal grandTotalReduction = BigDecimal.valueOf(grandTotalReductionDouble != null ? grandTotalReductionDouble : 0.0);

        // Post-process raw data to match expected format and calculate percentage
        return rawModelData.stream().map(item -> {
            Map<String, Object> processedItem = new HashMap<>();
            String model = (String) item.get("model");
            double reduction = ((Number) item.getOrDefault("totalReduction", 0.0)).doubleValue();
            long vehicleCount = ((Number) item.getOrDefault("vehicleCount", 0L)).longValue();
            
            BigDecimal reductionBd = BigDecimal.valueOf(reduction);
            BigDecimal percentage = BigDecimal.ZERO;
            if (grandTotalReduction.compareTo(BigDecimal.ZERO) > 0) { // Avoid division by zero
                percentage = reductionBd.divide(grandTotalReduction, CALCULATION_SCALE, ROUNDING_MODE).multiply(BigDecimal.valueOf(100));
            }

            processedItem.put("model", model);
            processedItem.put("reduction", reductionBd.setScale(2, ROUNDING_MODE));
            processedItem.put("percentage", percentage.setScale(1, ROUNDING_MODE)); // Percentage with 1 decimal place
            processedItem.put("vehicleCount", vehicleCount);
            return processedItem;
        })
        // Sort by reduction descending (optional)
        .sorted((m1, m2) -> ((BigDecimal) m2.get("reduction")).compareTo((BigDecimal) m1.get("reduction")))
        .collect(Collectors.toList());
    }

    @Override
    public DrivingData getDrivingDataSummary(String vin, LocalDate startDate, LocalDate endDate) {
        log.info("Fetching driving data summary for VIN: {}, Start: {}, End: {}", vin, startDate, endDate);
        Vehicle vehicle = vehicleRepository.findById(vin)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", vin));

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        // Corrected repository method call
        List<CarbonEmission> emissions = carbonEmissionRepository.findByVehicleAndCalculationTimeBetweenOrderByCalculationTimeDesc(
                vehicle, startDateTime, endDateTime);

        BigDecimal totalMileage = BigDecimal.ZERO;
        BigDecimal totalEnergy = BigDecimal.ZERO;
        BigDecimal totalReduction = BigDecimal.ZERO;

        for (CarbonEmission emission : emissions) {
             totalMileage = totalMileage.add(BigDecimal.valueOf(emission.getDistance()));
             totalEnergy = totalEnergy.add(BigDecimal.valueOf(emission.getEnergyConsumption()));
             totalReduction = totalReduction.add(BigDecimal.valueOf(emission.getCarbonReduction()));
        }

        BigDecimal averageEfficiency = BigDecimal.ZERO;
        if (totalMileage.compareTo(BigDecimal.ZERO) > 0) {
             averageEfficiency = totalEnergy.divide(totalMileage, CALCULATION_SCALE, ROUNDING_MODE).multiply(BigDecimal.valueOf(100));
        }

        // Create and return the DTO object
        return new DrivingData(
                totalMileage.setScale(2, ROUNDING_MODE),
                totalEnergy.setScale(2, ROUNDING_MODE),
                totalReduction.setScale(2, ROUNDING_MODE),
                averageEfficiency.setScale(2, ROUNDING_MODE)
        );
    }

    @Override
    public List<DrivingTimeSeriesPoint> getDrivingTimeSeries(String vin, LocalDate startDate, LocalDate endDate, String groupBy) {
        log.info("Fetching driving time series for VIN: {}, Start: {}, End: {}, GroupBy: {}", vin, startDate, endDate, groupBy);
        Vehicle vehicle = vehicleRepository.findById(vin)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", vin));

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        // --- Logic for Daily Aggregation --- 
        if ("day".equalsIgnoreCase(groupBy)) {
            List<CarbonEmissionRepository.DailyDrivingAggregate> dailyAggregates = 
                carbonEmissionRepository.findDailyDrivingAggregatesByVehicleAndTimeRange(vehicle, startDateTime, endDateTime);

            return dailyAggregates.stream()
                .map(agg -> {
                    BigDecimal mileage = BigDecimal.valueOf(agg.getTotalDistance() != null ? agg.getTotalDistance() : 0.0);
                    BigDecimal energy = BigDecimal.valueOf(agg.getTotalEnergyConsumption() != null ? agg.getTotalEnergyConsumption() : 0.0);
                    BigDecimal reduction = BigDecimal.valueOf(agg.getTotalCarbonReduction() != null ? agg.getTotalCarbonReduction() : 0.0);
                    BigDecimal energyPer100km = BigDecimal.ZERO;
                    if (mileage.compareTo(BigDecimal.ZERO) > 0) {
                        energyPer100km = energy.divide(mileage, CALCULATION_SCALE, ROUNDING_MODE).multiply(BigDecimal.valueOf(100));
                    }
                    return new DrivingTimeSeriesPoint(
                        agg.getCalculationDate().toString(),
                        mileage.setScale(2, ROUNDING_MODE),
                        energy.setScale(2, ROUNDING_MODE),
                        reduction.setScale(2, ROUNDING_MODE),
                        energyPer100km.setScale(2, ROUNDING_MODE)
                    );
                })
                .collect(Collectors.toList());
        }

        // --- Logic for Weekly/Monthly Aggregation (calculated in Java from daily/raw data) ---
        // Fetching all raw data for simplicity. Could optimize with daily aggregates.
        // Corrected repository method call
        List<CarbonEmission> emissions = carbonEmissionRepository.findByVehicleAndCalculationTimeBetweenOrderByCalculationTimeDesc(
                vehicle, startDateTime, endDateTime);

        if ("week".equalsIgnoreCase(groupBy)) {
            // Group by week (using ISO week fields)
            Map<Integer, List<CarbonEmission>> groupedByWeek = emissions.stream()
                .collect(Collectors.groupingBy(e -> e.getCalculationTime().get(WeekFields.ISO.weekOfYear())));
                
            return groupedByWeek.entrySet().stream()
                .sorted(Map.Entry.comparingByKey()) // Sort by week number
                .map(entry -> {
                    Integer weekNum = entry.getKey(); // Or derive start date of week
                    List<CarbonEmission> weekEmissions = entry.getValue();
                    LocalDate weekStartDate = weekEmissions.stream().map(e -> e.getCalculationTime().toLocalDate()).min(LocalDate::compareTo).orElse(null);

                    BigDecimal totalMileage = weekEmissions.stream().map(e -> BigDecimal.valueOf(e.getDistance())).reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal totalEnergy = weekEmissions.stream().map(e -> BigDecimal.valueOf(e.getEnergyConsumption())).reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal totalReduction = weekEmissions.stream().map(e -> BigDecimal.valueOf(e.getCarbonReduction())).reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal energyPer100km = BigDecimal.ZERO;
                    if (totalMileage.compareTo(BigDecimal.ZERO) > 0) {
                        energyPer100km = totalEnergy.divide(totalMileage, CALCULATION_SCALE, ROUNDING_MODE).multiply(BigDecimal.valueOf(100));
                    }
                    return new DrivingTimeSeriesPoint(
                        weekStartDate != null ? weekStartDate.toString() : "Week " + weekNum,
                        totalMileage.setScale(2, ROUNDING_MODE),
                        totalEnergy.setScale(2, ROUNDING_MODE),
                        totalReduction.setScale(2, ROUNDING_MODE),
                        energyPer100km.setScale(2, ROUNDING_MODE)
                    );
                })
                .collect(Collectors.toList());
        }

        if ("month".equalsIgnoreCase(groupBy)) {
             // Group by month
            Map<YearMonth, List<CarbonEmission>> groupedByMonth = emissions.stream()
                .collect(Collectors.groupingBy(e -> YearMonth.from(e.getCalculationTime())));

            return groupedByMonth.entrySet().stream()
                .sorted(Map.Entry.comparingByKey()) // Sort by month
                .map(entry -> {
                    YearMonth yearMonth = entry.getKey();
                    List<CarbonEmission> monthEmissions = entry.getValue();

                    BigDecimal totalMileage = monthEmissions.stream().map(e -> BigDecimal.valueOf(e.getDistance())).reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal totalEnergy = monthEmissions.stream().map(e -> BigDecimal.valueOf(e.getEnergyConsumption())).reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal totalReduction = monthEmissions.stream().map(e -> BigDecimal.valueOf(e.getCarbonReduction())).reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal energyPer100km = BigDecimal.ZERO;
                    if (totalMileage.compareTo(BigDecimal.ZERO) > 0) {
                        energyPer100km = totalEnergy.divide(totalMileage, CALCULATION_SCALE, ROUNDING_MODE).multiply(BigDecimal.valueOf(100));
                    }
                    return new DrivingTimeSeriesPoint(
                        yearMonth.atDay(1).toString(),
                        totalMileage.setScale(2, ROUNDING_MODE),
                        totalEnergy.setScale(2, ROUNDING_MODE),
                        totalReduction.setScale(2, ROUNDING_MODE),
                        energyPer100km.setScale(2, ROUNDING_MODE)
                    );
                })
                .collect(Collectors.toList());
        }

        log.warn("Unsupported groupBy value: {}. Defaulting to empty list.", groupBy);
        return Collections.emptyList(); // Default case or if groupBy is unsupported
    }

    @Override
    public List<HeatmapDataPoint> getVehicleHeatmapData(String vin, LocalDate startDate, LocalDate endDate, String valueType) {
        log.info("Fetching heatmap data for VIN: {}, Start: {}, End: {}, ValueType: {}", vin, startDate, endDate, valueType);
        Vehicle vehicle = vehicleRepository.findById(vin)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", vin));

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        // Fetch location and reduction data
        List<Object[]> locationData = carbonEmissionRepository.findLocationAndReductionByVehicleAndTimeRange(
            vehicle, startDateTime, endDateTime);

        if ("frequency".equalsIgnoreCase(valueType)) {
            // Aggregate by frequency (simple count per coordinate pair)
            // Note: Floating point comparison for grouping can be tricky. 
            // Consider rounding or using a spatial indexing approach for large datasets.
            Map<LatLon, Long> frequencyMap = locationData.stream()
                .filter(obj -> obj[0] instanceof Double && obj[1] instanceof Double) // Ensure data types
                .map(obj -> new LatLon((Double) obj[1], (Double) obj[0])) // Create LatLon key (lat, lon)
                .collect(Collectors.groupingBy(ll -> ll, Collectors.counting()));

            return frequencyMap.entrySet().stream()
                .map(entry -> new HeatmapDataPoint(entry.getKey().lat, entry.getKey().lon, entry.getValue().doubleValue()))
                .collect(Collectors.toList());
                
        } else if ("carbonReduction".equalsIgnoreCase(valueType)) {
             // Aggregate by summing carbon reduction per coordinate pair
            Map<LatLon, Double> reductionMap = locationData.stream()
                .filter(obj -> obj[0] instanceof Double && obj[1] instanceof Double && obj[2] instanceof Number) // Ensure data types
                .collect(Collectors.groupingBy(
                    obj -> new LatLon((Double) obj[1], (Double) obj[0]), // Group by LatLon
                    Collectors.summingDouble(obj -> ((Number) obj[2]).doubleValue()) // Sum reduction
                ));
                
            return reductionMap.entrySet().stream()
                .map(entry -> new HeatmapDataPoint(entry.getKey().lat, entry.getKey().lon, entry.getValue()))
                .collect(Collectors.toList());
                
        } else if ("duration".equalsIgnoreCase(valueType)) {
             // TODO: Implement duration aggregation if timestamp data per coordinate is available
             log.warn("Heatmap aggregation by 'duration' is not yet implemented.");
             return Collections.emptyList();
             
        } else {
             log.warn("Unsupported valueType for heatmap: {}. Defaulting to frequency or empty list.", valueType);
             // Defaulting to frequency as a fallback for now
             Map<LatLon, Long> frequencyMap = locationData.stream()
                .filter(obj -> obj[0] instanceof Double && obj[1] instanceof Double)
                .map(obj -> new LatLon((Double) obj[1], (Double) obj[0]))
                .collect(Collectors.groupingBy(ll -> ll, Collectors.counting()));
            return frequencyMap.entrySet().stream()
                .map(entry -> new HeatmapDataPoint(entry.getKey().lat, entry.getKey().lon, entry.getValue().doubleValue()))
                .collect(Collectors.toList());
        }
    }

    // Helper class for grouping by Lat/Lon (implement equals and hashCode)
    private static class LatLon {
        final double lat;
        final double lon;

        LatLon(double lat, double lon) {
            // Consider rounding for grouping stability if needed
            this.lat = lat; 
            this.lon = lon;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            LatLon latLon = (LatLon) o;
            return Double.compare(latLon.lat, lat) == 0 && Double.compare(latLon.lon, lon) == 0;
        }

        @Override
        public int hashCode() {
            return Objects.hash(lat, lon);
        }
    }

    @Override
    public List<Map<String, Object>> getPredictions(String vin, String period, int count) {
        // Find vehicle or throw exception
        Vehicle vehicle = vehicleRepository.findById(vin)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", vin));

        // 1. Determine historical data range
        LocalDateTime historyEndDate = LocalDateTime.now();
        LocalDateTime historyStartDate = historyEndDate.minusDays(PREDICTION_HISTORY_DAYS);

        // 2. Fetch Historical Data
        List<CarbonEmission> historicalEmissions = carbonEmissionRepository.findByVehicleAndCalculationTimeBetweenOrderByCalculationTimeDesc(
                vehicle, historyStartDate, historyEndDate);

        // 3. Calculate average daily reduction from history
        BigDecimal totalHistoricalReduction = BigDecimal.ZERO;
        if (!historicalEmissions.isEmpty()) {
            for (CarbonEmission emission : historicalEmissions) {
                totalHistoricalReduction = totalHistoricalReduction.add(BigDecimal.valueOf(emission.getCarbonReduction()));
            }
        }
        // Avoid division by zero if start and end are the same day or no data
        long actualHistoryDays = Math.max(1, ChronoUnit.DAYS.between(historyStartDate.toLocalDate(), historyEndDate.toLocalDate()));
        BigDecimal avgDailyReduction = totalHistoricalReduction.divide(BigDecimal.valueOf(actualHistoryDays), CALCULATION_SCALE, ROUNDING_MODE);

        // 4. Adjust average based on period
        BigDecimal avgPeriodReduction;
        switch (period.toLowerCase()) {
            case "week":
                avgPeriodReduction = avgDailyReduction.multiply(BigDecimal.valueOf(7));
                break;
            case "month":
                // Approximate month length
                avgPeriodReduction = avgDailyReduction.multiply(BigDecimal.valueOf(30)); 
                break;
            case "day":
            default:
                avgPeriodReduction = avgDailyReduction;
                break;
        }

        // 5. Generate Predictions
        List<Map<String, Object>> predictions = new ArrayList<>();
        LocalDateTime predictionStartDate = LocalDateTime.now(); // Start predictions from today/now

        for (int i = 0; i < count; i++) {
            Map<String, Object> prediction = new HashMap<>();
            LocalDateTime predictionDate;
            
            switch (period.toLowerCase()) {
                case "week":
                    predictionDate = predictionStartDate.plusWeeks(i);
                    break;
                case "month":
                    predictionDate = predictionStartDate.plusMonths(i);
                    break;
                case "day":
                default:
                    predictionDate = predictionStartDate.plusDays(i);
                    break;
            }
            
            // Calculate credits based on predicted reduction
            BigDecimal predictedCredits = avgPeriodReduction.multiply(BigDecimal.valueOf(CREDITS_PER_KG_CO2_REDUCTION));

            prediction.put("date", predictionDate.toLocalDate()); // Use LocalDate for the date
            prediction.put("carbonReduction", avgPeriodReduction.setScale(2, ROUNDING_MODE));
            prediction.put("credits", predictedCredits.setScale(2, ROUNDING_MODE));
            
            predictions.add(prediction);
        }
        
        return predictions;
    }

    @Deprecated
    @Override
    public Map<String, Object> getDrivingData(String vin, LocalDateTime startDate, LocalDateTime endDate, List<String> metrics) {
        log.warn("Deprecated getDrivingData called for VIN: {}. Use getDrivingDataSummary.", vin);
        // Call the new summary method and convert DTO to Map for backward compatibility (if needed)
        DrivingData summary = getDrivingDataSummary(vin, startDate.toLocalDate(), endDate.toLocalDate());
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("totalMileage", summary.getTotalMileage());
        resultMap.put("totalEnergy", summary.getTotalEnergy());
        resultMap.put("totalCarbonReduction", summary.getTotalCarbonReduction());
        resultMap.put("averageEfficiency", summary.getAverageEfficiency());
        return resultMap;
    }
} 