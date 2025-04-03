package com.example.evcarbonmonitor.service;

import com.example.evcarbonmonitor.domain.CarbonEmission;
import com.example.evcarbonmonitor.domain.Vehicle;
import com.example.evcarbonmonitor.repository.CarbonEmissionRepository;
import com.example.evcarbonmonitor.repository.VehicleRepository;
import com.example.evcarbonmonitor.service.impl.AnalyticsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private CarbonEmissionRepository carbonEmissionRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private AnalyticsServiceImpl analyticsService;

    private Vehicle vehicle1;
    private Vehicle vehicle2;
    private CarbonEmission emission1;
    private CarbonEmission emission2;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @BeforeEach
    void setUp() {
        vehicle1 = new Vehicle();
        vehicle1.setId(1L);
        vehicle1.setVin("VIN001");
        vehicle1.setModel("Model A");

        vehicle2 = new Vehicle();
        vehicle2.setId(2L);
        vehicle2.setVin("VIN002");
        vehicle2.setModel("Model B");

        startDate = LocalDateTime.now().minusDays(7);
        endDate = LocalDateTime.now();

        emission1 = new CarbonEmission();
        emission1.setId(1L);
        emission1.setVehicle(vehicle1);
        emission1.setDistance(100.0);
        emission1.setEnergyConsumption(20.0);
        emission1.setCarbonEmission(5.0);
        emission1.setCarbonReduction(10.0);
        emission1.setCalculationTime(startDate.plusDays(1));

        emission2 = new CarbonEmission();
        emission2.setId(2L);
        emission2.setVehicle(vehicle2);
        emission2.setDistance(150.0);
        emission2.setEnergyConsumption(30.0);
        emission2.setCarbonEmission(7.5);
        emission2.setCarbonReduction(15.0);
        emission2.setCalculationTime(startDate.plusDays(2));
    }

    @Test
    void getCarbonSummary_ShouldReturnSummaryData() {
        // Arrange
        when(vehicleRepository.findAll()).thenReturn(Arrays.asList(vehicle1, vehicle2));
        when(carbonEmissionRepository.getCarbonReductionByVehicleAndTimeRange(any(), any(), any()))
                .thenReturn(10.0, 15.0);

        // Act
        Map<String, Object> summary = analyticsService.getCarbonSummary(startDate, endDate);

        // Assert
        assertNotNull(summary);
        assertEquals(25.0, summary.get("totalReduction"));
        assertTrue(summary.containsKey("monthlyAverage"));
        assertTrue(summary.containsKey("dailyAverage"));
        assertTrue(summary.containsKey("fuelReduction"));
        assertTrue(summary.containsKey("equivalentTrees"));
        assertTrue(summary.containsKey("equivalentCO2"));
    }

    @Test
    void getCarbonTrends_ShouldReturnTrendData() {
        // Arrange
        when(vehicleRepository.findAll()).thenReturn(Arrays.asList(vehicle1, vehicle2));
        when(carbonEmissionRepository.getCarbonReductionByVehicleAndTimeRange(any(), any(), any()))
                .thenReturn(10.0, 15.0);

        // Act
        List<Map<String, Object>> trends = analyticsService.getCarbonTrends(startDate, endDate, "day");

        // Assert
        assertNotNull(trends);
        assertFalse(trends.isEmpty());
        assertTrue(trends.get(0).containsKey("date"));
        assertTrue(trends.get(0).containsKey("carbonReduction"));
        assertTrue(trends.get(0).containsKey("credits"));
    }

    @Test
    void getCarbonByModel_ShouldReturnModelData() {
        // Arrange
        when(vehicleRepository.findAll()).thenReturn(Arrays.asList(vehicle1, vehicle2));
        when(carbonEmissionRepository.getCarbonReductionByVehicleAndTimeRange(any(), any(), any()))
                .thenReturn(10.0, 15.0);
        when(carbonEmissionRepository.findByVehicleAndCalculationTimeBetweenOrderByCalculationTimeDesc(any(), any(), any()))
                .thenReturn(Arrays.asList(emission1), Arrays.asList(emission2));

        // Act
        List<Map<String, Object>> modelData = analyticsService.getCarbonByModel(startDate, endDate);

        // Assert
        assertNotNull(modelData);
        assertEquals(2, modelData.size());
        assertTrue(modelData.get(0).containsKey("model"));
        assertTrue(modelData.get(0).containsKey("totalReduction"));
        assertTrue(modelData.get(0).containsKey("averageReduction"));
    }

    @Test
    void getDrivingData_ShouldReturnDrivingMetrics() {
        // Arrange
        when(vehicleRepository.findByVin("VIN001")).thenReturn(java.util.Optional.of(vehicle1));
        when(carbonEmissionRepository.findByVehicleAndCalculationTimeBetweenOrderByCalculationTimeDesc(any(), any(), any()))
                .thenReturn(Arrays.asList(emission1));

        // Act
        Map<String, Object> drivingData = analyticsService.getDrivingData("VIN001", startDate, endDate,
                Arrays.asList("mileage", "energy", "carbonReduction", "efficiency"));

        // Assert
        assertNotNull(drivingData);
        assertEquals(100.0, drivingData.get("totalMileage"));
        assertEquals(20.0, drivingData.get("totalEnergy"));
        assertEquals(10.0, drivingData.get("totalReduction"));
        assertTrue(drivingData.containsKey("efficiency"));
    }

    @Test
    void getPredictions_ShouldReturnPredictionData() {
        // Act
        List<Map<String, Object>> predictions = analyticsService.getPredictions("VIN001", "day", 7);

        // Assert
        assertNotNull(predictions);
        assertEquals(7, predictions.size());
        assertTrue(predictions.get(0).containsKey("date"));
        assertTrue(predictions.get(0).containsKey("carbonReduction"));
        assertTrue(predictions.get(0).containsKey("credits"));
    }

    @Test
    void getHeatmapData_ShouldReturnHeatmapData() {
        // Act
        List<Map<String, Object>> heatmapData = analyticsService.getHeatmapData(LocalDateTime.now(), "hour");

        // Assert
        assertNotNull(heatmapData);
        assertEquals(24, heatmapData.size());
        assertTrue(heatmapData.get(0).containsKey("hour"));
        assertTrue(heatmapData.get(0).containsKey("value"));
    }
} 