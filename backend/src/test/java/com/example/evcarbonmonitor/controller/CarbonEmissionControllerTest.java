package com.example.evcarbonmonitor.controller;

import com.example.evcarbonmonitor.domain.CarbonEmission;
import com.example.evcarbonmonitor.domain.Vehicle;
import com.example.evcarbonmonitor.service.CarbonEmissionService;
import com.example.evcarbonmonitor.service.VehicleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CarbonEmissionControllerTest {

    @Mock
    private CarbonEmissionService carbonEmissionService;

    @Mock
    private VehicleService vehicleService;

    @InjectMocks
    private CarbonEmissionController carbonEmissionController;

    private Vehicle testVehicle;
    private CarbonEmission testEmission;
    private Long vehicleId = 1L;

    @BeforeEach
    void setUp() {
        testVehicle = new Vehicle();
        testVehicle.setId(vehicleId);
        testVehicle.setVin("TEST123456789");

        testEmission = new CarbonEmission();
        testEmission.setId(1L);
        testEmission.setVehicle(testVehicle);
        testEmission.setDistance(100.0);
        testEmission.setEnergyConsumption(20.0);
        testEmission.setCarbonEmission(17.588);
        testEmission.setCarbonReduction(2.412);
        testEmission.setCalculationTime(LocalDateTime.now());
        testEmission.setCalculationMethod("基于电网排放因子和传统燃油车基准情景");
    }

    @Test
    void calculateCarbonEmission_ShouldReturnEmission() {
        when(vehicleService.getVehicleById(vehicleId)).thenReturn(testVehicle);
        when(carbonEmissionService.calculateAndSave(any(), any(), any())).thenReturn(testEmission);

        ResponseEntity<CarbonEmission> response = carbonEmissionController.calculateCarbonEmission(
                vehicleId, 100.0, 20.0);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(testEmission, response.getBody());

        verify(vehicleService).getVehicleById(vehicleId);
        verify(carbonEmissionService).calculateAndSave(any(), any(), any());
    }

    @Test
    void getVehicleCarbonEmissions_ShouldReturnEmissionsList() {
        when(vehicleService.getVehicleById(vehicleId)).thenReturn(testVehicle);
        when(carbonEmissionService.getVehicleCarbonEmissions(any())).thenReturn(Arrays.asList(testEmission));

        ResponseEntity<List<CarbonEmission>> response = carbonEmissionController.getVehicleCarbonEmissions(vehicleId);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
        assertEquals(testEmission, response.getBody().get(0));

        verify(vehicleService).getVehicleById(vehicleId);
        verify(carbonEmissionService).getVehicleCarbonEmissions(any());
    }

    @Test
    void getVehicleCarbonEmissionsByTimeRange_ShouldReturnEmissionsInRange() {
        LocalDateTime startTime = LocalDateTime.now().minusDays(1);
        LocalDateTime endTime = LocalDateTime.now();
        when(vehicleService.getVehicleById(vehicleId)).thenReturn(testVehicle);
        when(carbonEmissionService.getVehicleCarbonEmissionsByTimeRange(any(), any(), any()))
                .thenReturn(Arrays.asList(testEmission));

        ResponseEntity<List<CarbonEmission>> response = carbonEmissionController.getVehicleCarbonEmissionsByTimeRange(
                vehicleId, startTime, endTime);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
        assertEquals(testEmission, response.getBody().get(0));

        verify(vehicleService).getVehicleById(vehicleId);
        verify(carbonEmissionService).getVehicleCarbonEmissionsByTimeRange(any(), any(), any());
    }

    @Test
    void getTotalCarbonReduction_ShouldReturnTotalReduction() {
        when(vehicleService.getVehicleById(vehicleId)).thenReturn(testVehicle);
        when(carbonEmissionService.getTotalCarbonReduction(any())).thenReturn(100.0);

        ResponseEntity<Double> response = carbonEmissionController.getTotalCarbonReduction(vehicleId);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(100.0, response.getBody());

        verify(vehicleService).getVehicleById(vehicleId);
        verify(carbonEmissionService).getTotalCarbonReduction(any());
    }

    @Test
    void getCarbonReductionByTimeRange_ShouldReturnReductionInRange() {
        LocalDateTime startTime = LocalDateTime.now().minusDays(1);
        LocalDateTime endTime = LocalDateTime.now();
        when(vehicleService.getVehicleById(vehicleId)).thenReturn(testVehicle);
        when(carbonEmissionService.getCarbonReductionByTimeRange(any(), any(), any())).thenReturn(50.0);

        ResponseEntity<Double> response = carbonEmissionController.getCarbonReductionByTimeRange(
                vehicleId, startTime, endTime);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(50.0, response.getBody());

        verify(vehicleService).getVehicleById(vehicleId);
        verify(carbonEmissionService).getCarbonReductionByTimeRange(any(), any(), any());
    }
} 