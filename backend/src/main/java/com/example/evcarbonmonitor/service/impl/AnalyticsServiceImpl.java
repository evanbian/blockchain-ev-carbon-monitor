package com.example.evcarbonmonitor.service.impl;

import com.example.evcarbonmonitor.domain.CarbonEmission;
import com.example.evcarbonmonitor.domain.Vehicle;
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
import java.util.*;
import java.util.stream.Collectors;

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
    public Map<String, Object> getDrivingData(String vin, LocalDateTime startDate, LocalDateTime endDate, List<String> metrics) {
        Vehicle vehicle = vehicleRepository.findById(vin)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", vin));
        
        List<CarbonEmission> emissions = carbonEmissionRepository.findByVehicleAndCalculationTimeBetweenOrderByCalculationTimeDesc(
                vehicle, startDate, endDate);
        
        Map<String, Object> drivingData = new HashMap<>();
        
        // Use BigDecimal for calculations if precision is important
        BigDecimal totalMileage = BigDecimal.ZERO;
        BigDecimal totalEnergy = BigDecimal.ZERO;
        BigDecimal totalReduction = BigDecimal.ZERO;

        for (CarbonEmission emission : emissions) {
             totalMileage = totalMileage.add(BigDecimal.valueOf(emission.getDistance()));
             totalEnergy = totalEnergy.add(BigDecimal.valueOf(emission.getEnergyConsumption()));
             totalReduction = totalReduction.add(BigDecimal.valueOf(emission.getCarbonReduction()));
        }

        if (metrics.contains("mileage")) {
            drivingData.put("totalMileage", totalMileage.setScale(2, ROUNDING_MODE));
        }
        
        if (metrics.contains("energy")) {
            drivingData.put("totalEnergy", totalEnergy.setScale(2, ROUNDING_MODE));
        }
        
        if (metrics.contains("carbonReduction")) {
            drivingData.put("totalReduction", totalReduction.setScale(2, ROUNDING_MODE));
        }
        
        if (metrics.contains("efficiency")) {
             BigDecimal efficiency = BigDecimal.ZERO;
             if (totalMileage.compareTo(BigDecimal.ZERO) > 0) {
                 efficiency = totalEnergy.divide(totalMileage, CALCULATION_SCALE, ROUNDING_MODE).multiply(BigDecimal.valueOf(100));
             }
            drivingData.put("efficiency", efficiency.setScale(2, ROUNDING_MODE));
        }
        
        return drivingData;
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

    @Override
    public List<Map<String, Object>> getHeatmapData(LocalDateTime date, String resolution) {
        // Determine the time range based on the input date (usually for the entire day)
        LocalDateTime startTime = date.toLocalDate().atStartOfDay(); // Start of the given day
        LocalDateTime endTime = startTime.plusDays(1); // End of the given day (exclusive)

        log.info("Fetching heatmap data points between {} and {}", startTime, endTime);

        // Fetch data points using the new repository method
        List<Map<String, Object>> heatmapPoints = carbonEmissionRepository.findHeatmapDataPoints(startTime, endTime);

        log.info("Found {} heatmap data points", heatmapPoints.size());

        // The repository query already aliases columns to lat, lng, count.
        // We might need further processing or aggregation based on 'resolution' if needed,
        // but the base query provides individual points suitable for many heatmap libraries.
        // For now, we return the raw points directly as the format matches common heatmap libraries.

        // Example: If resolution was 'hour', we could aggregate here:
        // if ("hour".equalsIgnoreCase(resolution)) {
        //     return heatmapPoints.stream()
        //         .collect(Collectors.groupingBy(
        //             p -> ((LocalDateTime)p.get("calculationTime")).getHour(), // Assuming calculationTime was fetched
        //             Collectors.summingDouble(p -> ((Number)p.get("count")).doubleValue())
        //         )).entrySet().stream()
        //         .map(entry -> Map.of("hour", entry.getKey(), "value", entry.getValue()))
        //         .collect(Collectors.toList());
        // }

        // Return the list of points {lat, lng, count}
        // Ensure the count value is a Number (Double in this case)
        return heatmapPoints.stream()
                .peek(point -> {
                    // Optional: Ensure count is a valid number, default to 0 if not
                    Object countObj = point.get("count");
                    if (!(countObj instanceof Number)) {
                        point.put("count", 0.0);
                    } else {
                         // Ensure lat/lng are also doubles
                         Object latObj = point.get("lat");
                         Object lngObj = point.get("lng");
                         if (!(latObj instanceof Double)) point.put("lat", 0.0);
                         if (!(lngObj instanceof Double)) point.put("lng", 0.0);
                    }
                })
                .collect(Collectors.toList());
    }
} 