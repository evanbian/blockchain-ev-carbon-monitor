package com.example.evcarbonmonitor.service.impl;

import com.example.evcarbonmonitor.domain.CarbonEmission;
import com.example.evcarbonmonitor.domain.Vehicle;
import com.example.evcarbonmonitor.repository.CarbonEmissionRepository;
import com.example.evcarbonmonitor.service.CarbonEmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CarbonEmissionServiceImpl implements CarbonEmissionService {

    private final CarbonEmissionRepository carbonEmissionRepository;
    
    // 电网排放因子（kgCO2e/kWh）
    private static final double GRID_EMISSION_FACTOR = 0.8794;
    
    // 传统燃油车排放因子（kgCO2e/km）
    private static final double ICE_VEHICLE_EMISSION_FACTOR = 0.2;

    @Override
    @Transactional
    public CarbonEmission calculateAndSave(Vehicle vehicle, Double distance, Double energyConsumption) {
        // 计算电动汽车的碳排放
        double evCarbonEmission = energyConsumption * GRID_EMISSION_FACTOR;
        
        // 计算传统燃油车的碳排放（基准情景）
        double iceCarbonEmission = distance * ICE_VEHICLE_EMISSION_FACTOR;
        
        // 计算碳减排量
        double carbonReduction = iceCarbonEmission - evCarbonEmission;
        
        // 创建并保存碳减排记录
        CarbonEmission carbonEmission = new CarbonEmission();
        carbonEmission.setVehicle(vehicle);
        carbonEmission.setDistance(distance);
        carbonEmission.setEnergyConsumption(energyConsumption);
        carbonEmission.setCarbonEmission(evCarbonEmission);
        carbonEmission.setCarbonReduction(carbonReduction);
        carbonEmission.setCalculationTime(LocalDateTime.now());
        carbonEmission.setCalculationMethod("基于电网排放因子和传统燃油车基准情景");
        
        return carbonEmissionRepository.save(carbonEmission);
    }

    @Override
    public List<CarbonEmission> getVehicleCarbonEmissions(Vehicle vehicle) {
        return carbonEmissionRepository.findByVehicleOrderByCalculationTimeDesc(vehicle);
    }

    @Override
    public List<CarbonEmission> getVehicleCarbonEmissionsByTimeRange(
            Vehicle vehicle, LocalDateTime startTime, LocalDateTime endTime) {
        return carbonEmissionRepository.findByVehicleAndCalculationTimeBetweenOrderByCalculationTimeDesc(
                vehicle, startTime, endTime);
    }

    @Override
    public Double getTotalCarbonReduction(Vehicle vehicle) {
        return carbonEmissionRepository.getTotalCarbonReductionByVehicle(vehicle);
    }

    @Override
    public Double getCarbonReductionByTimeRange(
            Vehicle vehicle, LocalDateTime startTime, LocalDateTime endTime) {
        return carbonEmissionRepository.getCarbonReductionByVehicleAndTimeRange(
                vehicle, startTime, endTime);
    }
} 