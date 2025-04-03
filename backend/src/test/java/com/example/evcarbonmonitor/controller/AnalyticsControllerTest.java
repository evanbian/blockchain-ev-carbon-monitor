package com.example.evcarbonmonitor.controller;

import com.example.evcarbonmonitor.service.AnalyticsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsControllerTest {

    @Mock
    private AnalyticsService analyticsService;

    @InjectMocks
    private AnalyticsController analyticsController;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Map<String, Object> mockSummary;
    private List<Map<String, Object>> mockTrends;
    private List<Map<String, Object>> mockModelData;
    private Map<String, Object> mockDrivingData;
    private List<Map<String, Object>> mockPredictions;
    private List<Map<String, Object>> mockHeatmapData;

    @BeforeEach
    void setUp() {
        startDate = LocalDateTime.now().minusDays(7);
        endDate = LocalDateTime.now();

        mockSummary = new HashMap<>();
        mockSummary.put("totalReduction", 25.0);
        mockSummary.put("monthlyAverage", 100.0);
        mockSummary.put("dailyAverage", 3.57);

        mockTrends = Arrays.asList(
            createMockTrendData(startDate, 10.0),
            createMockTrendData(startDate.plusDays(1), 15.0)
        );

        mockModelData = Arrays.asList(
            createMockModelData("Model A", 10.0, 0.1),
            createMockModelData("Model B", 15.0, 0.15)
        );

        mockDrivingData = new HashMap<>();
        mockDrivingData.put("totalMileage", 100.0);
        mockDrivingData.put("totalEnergy", 20.0);
        mockDrivingData.put("totalReduction", 10.0);
        mockDrivingData.put("efficiency", 20.0);

        mockPredictions = Arrays.asList(
            createMockPredictionData(startDate, 10.0, 0.5),
            createMockPredictionData(startDate.plusDays(1), 12.0, 0.6)
        );

        mockHeatmapData = Arrays.asList(
            createMockHeatmapData(0, 50.0),
            createMockHeatmapData(1, 75.0)
        );
    }

    @Test
    void getCarbonSummary_ShouldReturnSummaryData() {
        // Arrange
        when(analyticsService.getCarbonSummary(any(), any())).thenReturn(mockSummary);

        // Act
        ResponseEntity<Map<String, Object>> response = analyticsController.getCarbonSummary(startDate, endDate);

        // Assert
        assertTrue(response.getStatusCode().is2xxSuccessful());
        assertEquals(mockSummary, response.getBody());
    }

    @Test
    void getCarbonTrends_ShouldReturnTrendData() {
        // Arrange
        when(analyticsService.getCarbonTrends(any(), any(), any())).thenReturn(mockTrends);

        // Act
        ResponseEntity<List<Map<String, Object>>> response = analyticsController.getCarbonTrends(startDate, endDate, "day");

        // Assert
        assertTrue(response.getStatusCode().is2xxSuccessful());
        assertEquals(mockTrends, response.getBody());
    }

    @Test
    void getCarbonByModel_ShouldReturnModelData() {
        // Arrange
        when(analyticsService.getCarbonByModel(any(), any())).thenReturn(mockModelData);

        // Act
        ResponseEntity<List<Map<String, Object>>> response = analyticsController.getCarbonByModel(startDate, endDate);

        // Assert
        assertTrue(response.getStatusCode().is2xxSuccessful());
        assertEquals(mockModelData, response.getBody());
    }

    @Test
    void getDrivingData_ShouldReturnDrivingMetrics() {
        // Arrange
        when(analyticsService.getDrivingData(any(), any(), any(), any())).thenReturn(mockDrivingData);

        // Act
        ResponseEntity<Map<String, Object>> response = analyticsController.getDrivingData(
                "VIN001", startDate, endDate, Arrays.asList("mileage", "energy", "carbonReduction", "efficiency"));

        // Assert
        assertTrue(response.getStatusCode().is2xxSuccessful());
        assertEquals(mockDrivingData, response.getBody());
    }

    @Test
    void getPredictions_ShouldReturnPredictionData() {
        // Arrange
        when(analyticsService.getPredictions(any(), any(), any())).thenReturn(mockPredictions);

        // Act
        ResponseEntity<List<Map<String, Object>>> response = analyticsController.getPredictions("VIN001", "day", 7);

        // Assert
        assertTrue(response.getStatusCode().is2xxSuccessful());
        assertEquals(mockPredictions, response.getBody());
    }

    @Test
    void getHeatmapData_ShouldReturnHeatmapData() {
        // Arrange
        when(analyticsService.getHeatmapData(any(), any())).thenReturn(mockHeatmapData);

        // Act
        ResponseEntity<List<Map<String, Object>>> response = analyticsController.getHeatmapData(startDate, "hour");

        // Assert
        assertTrue(response.getStatusCode().is2xxSuccessful());
        assertEquals(mockHeatmapData, response.getBody());
    }

    private Map<String, Object> createMockTrendData(LocalDateTime date, double carbonReduction) {
        Map<String, Object> data = new HashMap<>();
        data.put("date", date);
        data.put("carbonReduction", carbonReduction);
        data.put("credits", carbonReduction * 0.05);
        return data;
    }

    private Map<String, Object> createMockModelData(String model, double totalReduction, double averageReduction) {
        Map<String, Object> data = new HashMap<>();
        data.put("model", model);
        data.put("totalReduction", totalReduction);
        data.put("averageReduction", averageReduction);
        return data;
    }

    private Map<String, Object> createMockPredictionData(LocalDateTime date, double carbonReduction, double credits) {
        Map<String, Object> data = new HashMap<>();
        data.put("date", date);
        data.put("carbonReduction", carbonReduction);
        data.put("credits", credits);
        return data;
    }

    private Map<String, Object> createMockHeatmapData(int hour, double value) {
        Map<String, Object> data = new HashMap<>();
        data.put("hour", hour);
        data.put("value", value);
        return data;
    }
} 