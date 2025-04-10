package com.example.evcarbonmonitor.controller;

import com.example.evcarbonmonitor.dto.ApiResponse;
// Assuming DTOs exist or will be created later
// import com.example.evcarbonmonitor.dto.DrivingData;
// import com.example.evcarbonmonitor.dto.DrivingTimeSeriesPoint;
// import com.example.evcarbonmonitor.dto.HeatmapDataPoint;
import com.example.evcarbonmonitor.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
// Removed LocalDateTime import as we primarily use LocalDate for daily/weekly/monthly aggregation
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/carbon/summary")
    public ApiResponse<Map<String, Object>> getCarbonSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        // Assuming service returns a structure compatible with CarbonSummary defined in frontend
        return ApiResponse.success(analyticsService.getCarbonSummary(startDate, endDate));
    }

    @GetMapping("/carbon/trends")
    public ApiResponse<Map<String, Object>> getCarbonTrends(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "day") String groupBy) {
        // Assuming service returns a List<Map<String, Object>> compatible with CarbonTrend
        List<Map<String, Object>> trendsList = analyticsService.getCarbonTrends(startDate, endDate, groupBy);
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("timeline", trendsList); // Keep the 'timeline' key as per interface.md
        return ApiResponse.success(responseData);
    }

    @GetMapping("/carbon/by-model")
    public ApiResponse<Map<String, Object>> getCarbonByModel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        // Assuming service returns a List<Map<String, Object>> compatible with CarbonModelData
        List<Map<String, Object>> modelList = analyticsService.getCarbonByModel(startDate, endDate);
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("models", modelList); // Keep the 'models' key as per interface.md
        return ApiResponse.success(responseData);
    }

    // --- Vehicle Specific Endpoints Moved to VehicleAnalyticsController ---
    // Removed: getDrivingDataSummary (GET /driving/{vin})
    // Removed: getDrivingTimeSeries (GET /driving/{vin}/timeseries)
    // Removed: getVehicleHeatmapData (GET /heatmap/{vin})
    // Removed: getPredictions (GET /predictions/{vin})

} 