package com.example.evcarbonmonitor.controller;

import com.example.evcarbonmonitor.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/carbon/summary")
    public ResponseEntity<Map<String, Object>> getCarbonSummary(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return ResponseEntity.ok(analyticsService.getCarbonSummary(startDate, endDate));
    }

    @GetMapping("/carbon/trends")
    public ResponseEntity<Map<String, Object>> getCarbonTrends(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @RequestParam(defaultValue = "day") String groupBy) {
        List<Map<String, Object>> trendsList = analyticsService.getCarbonTrends(startDate, endDate, groupBy);
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("timeline", trendsList);
        return ResponseEntity.ok(responseData);
    }

    @GetMapping("/carbon/by-model")
    public ResponseEntity<Map<String, Object>> getCarbonByModel(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        List<Map<String, Object>> modelList = analyticsService.getCarbonByModel(startDate, endDate);
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("models", modelList);
        return ResponseEntity.ok(responseData);
    }

    @GetMapping("/driving/{vin}")
    public ResponseEntity<Map<String, Object>> getDrivingData(
            @PathVariable String vin,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam List<String> metrics) {
        return ResponseEntity.ok(analyticsService.getDrivingData(vin, startDate, endDate, metrics));
    }

    @GetMapping("/predictions/{vin}")
    public ResponseEntity<List<Map<String, Object>>> getPredictions(
            @PathVariable String vin,
            @RequestParam(defaultValue = "day") String period,
            @RequestParam(defaultValue = "7") int count) {
        return ResponseEntity.ok(analyticsService.getPredictions(vin, period, count));
    }

    @GetMapping("/heatmap")
    public ResponseEntity<List<Map<String, Object>>> getHeatmapData(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date,
            @RequestParam(defaultValue = "hour") String resolution) {
        return ResponseEntity.ok(analyticsService.getHeatmapData(date, resolution));
    }
} 