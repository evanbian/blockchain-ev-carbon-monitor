package com.example.evcarbonmonitor.controller;

import com.example.evcarbonmonitor.dto.ApiResponse;
import com.example.evcarbonmonitor.dto.DrivingData;
import com.example.evcarbonmonitor.dto.DrivingTimeSeriesPoint;
import com.example.evcarbonmonitor.dto.HeatmapDataPoint;
// import com.example.evcarbonmonitor.dto.PredictionData; // If moving predictions
import com.example.evcarbonmonitor.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/vehicles/{vin}/analytics") // Base path for vehicle-specific analytics
@RequiredArgsConstructor
public class VehicleAnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * GET /api/v1/vehicles/{vin}/analytics : Get summary driving data for a specific vehicle.
     * (Previously GET /api/v1/analytics/driving/{vin})
     */
    @GetMapping // Mapped to the base path
    public ApiResponse<DrivingData> getDrivingDataSummary(
            @PathVariable String vin,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        // TODO: Ensure AnalyticsService.getDrivingDataSummary exists and returns correct Map/DTO
        return ApiResponse.success(analyticsService.getDrivingDataSummary(vin, startDate, endDate));
    }

    /**
     * GET /api/v1/vehicles/{vin}/analytics/timeseries : Get time series driving data for a specific vehicle.
     * (Previously GET /api/v1/analytics/driving/{vin}/timeseries)
     */
    @GetMapping("/timeseries")
    public ApiResponse<List<DrivingTimeSeriesPoint>> getDrivingTimeSeries(
            @PathVariable String vin,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "day") String groupBy) {
        // TODO: Ensure AnalyticsService.getDrivingTimeSeries exists and returns List<Map/DTO>
        List<DrivingTimeSeriesPoint> timeSeriesData = analyticsService.getDrivingTimeSeries(vin, startDate, endDate, groupBy);
        return ApiResponse.success(timeSeriesData);
    }

    /**
     * GET /api/v1/vehicles/{vin}/analytics/heatmap : Get heatmap data for a specific vehicle.
     * (Previously GET /api/v1/analytics/heatmap/{vin})
     */
    @GetMapping("/heatmap")
    public ApiResponse<List<HeatmapDataPoint>> getVehicleHeatmapData(
            @PathVariable String vin,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "frequency") String valueType) {
        // TODO: Ensure AnalyticsService.getVehicleHeatmapData exists and returns List<Map/DTO>
        List<HeatmapDataPoint> heatmapData = analyticsService.getVehicleHeatmapData(vin, startDate, endDate, valueType);
        return ApiResponse.success(heatmapData);
    }

    /**
     * GET /api/v1/vehicles/{vin}/analytics/predictions : Get predictions for a specific vehicle.
     * (Moved from /api/v1/analytics/predictions/{vin})
     */
    @GetMapping("/predictions")
    public ApiResponse<List<Map<String, Object>>> getPredictions(
            @PathVariable String vin,
            @RequestParam(defaultValue = "day") String period,
            @RequestParam(defaultValue = "7") int count) {
        // TODO: Ensure AnalyticsService.getPredictions exists and returns List<Map/DTO>
        return ApiResponse.success(analyticsService.getPredictions(vin, period, count));
    }

}