package com.example.evcarbonmonitor.service;

import com.example.evcarbonmonitor.domain.CarbonEmission;
import com.example.evcarbonmonitor.domain.Vehicle;
import com.example.evcarbonmonitor.repository.CarbonEmissionRepository;
import com.example.evcarbonmonitor.service.impl.CarbonEmissionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CarbonEmissionServiceTest {

    @Mock
    private CarbonEmissionRepository carbonEmissionRepository;

    @InjectMocks
    private CarbonEmissionServiceImpl carbonEmissionService;

    private Vehicle testVehicle;
    private CarbonEmission testEmission;

    @BeforeEach
    void setUp() {
        testVehicle = new Vehicle();
        testVehicle.setId(1L);
        testVehicle.setVin("TEST123456789");

        testEmission = new CarbonEmission();
        testEmission.setId(1L);
        testEmission.setVehicle(testVehicle);
        testEmission.setDistance(100.0);
        testEmission.setEnergyConsumption(20.0);
        testEmission.setCarbonEmission(17.588); // 20.0 * 0.8794
        testEmission.setCarbonReduction(2.412); // 20.0 - 17.588
        testEmission.setCalculationTime(LocalDateTime.now());
        testEmission.setCalculationMethod("基于电网排放因子和传统燃油车基准情景");
    }

    @Test
    void calculateAndSave_ShouldCalculateAndSaveEmission() {
        when(carbonEmissionRepository.save(any(CarbonEmission.class))).thenReturn(testEmission);

        CarbonEmission result = carbonEmissionService.calculateAndSave(testVehicle, 100.0, 20.0);

        assertNotNull(result);
        assertEquals(testVehicle, result.getVehicle());
        assertEquals(100.0, result.getDistance());
        assertEquals(20.0, result.getEnergyConsumption());
        assertEquals(17.588, result.getCarbonEmission(), 0.001);
        assertEquals(2.412, result.getCarbonReduction(), 0.001);
        assertNotNull(result.getCalculationTime());
        assertEquals("基于电网排放因子和传统燃油车基准情景", result.getCalculationMethod());

        verify(carbonEmissionRepository).save(any(CarbonEmission.class));
    }

    @Test
    void getVehicleCarbonEmissions_ShouldReturnEmissionsList() {
        List<CarbonEmission> expectedEmissions = Arrays.asList(testEmission);
        when(carbonEmissionRepository.findByVehicleOrderByCalculationTimeDesc(testVehicle))
                .thenReturn(expectedEmissions);

        List<CarbonEmission> result = carbonEmissionService.getVehicleCarbonEmissions(testVehicle);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testEmission, result.get(0));
    }

    @Test
    void getVehicleCarbonEmissionsByTimeRange_ShouldReturnEmissionsInRange() {
        LocalDateTime startTime = LocalDateTime.now().minusDays(1);
        LocalDateTime endTime = LocalDateTime.now();
        List<CarbonEmission> expectedEmissions = Arrays.asList(testEmission);
        when(carbonEmissionRepository.findByVehicleAndCalculationTimeBetweenOrderByCalculationTimeDesc(
                testVehicle, startTime, endTime)).thenReturn(expectedEmissions);

        List<CarbonEmission> result = carbonEmissionService.getVehicleCarbonEmissionsByTimeRange(
                testVehicle, startTime, endTime);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testEmission, result.get(0));
    }

    @Test
    void getTotalCarbonReduction_ShouldReturnTotalReduction() {
        when(carbonEmissionRepository.getTotalCarbonReductionByVehicle(testVehicle))
                .thenReturn(100.0);

        Double result = carbonEmissionService.getTotalCarbonReduction(testVehicle);

        assertNotNull(result);
        assertEquals(100.0, result);
    }

    @Test
    void getCarbonReductionByTimeRange_ShouldReturnReductionInRange() {
        LocalDateTime startTime = LocalDateTime.now().minusDays(1);
        LocalDateTime endTime = LocalDateTime.now();
        when(carbonEmissionRepository.getCarbonReductionByVehicleAndTimeRange(
                testVehicle, startTime, endTime)).thenReturn(50.0);

        Double result = carbonEmissionService.getCarbonReductionByTimeRange(
                testVehicle, startTime, endTime);

        assertNotNull(result);
        assertEquals(50.0, result);
    }
} 