package com.example.evcarbonmonitor.service;

import com.example.evcarbonmonitor.domain.CarbonEmission;
import com.example.evcarbonmonitor.domain.Vehicle;

import java.time.LocalDateTime;
import java.util.List;

public interface CarbonEmissionService {
    
    /**
     * 计算并保存碳减排数据
     * @param vehicle 车辆信息
     * @param distance 行驶距离(km)
     * @param energyConsumption 能耗(kWh)
     * @return 计算后的碳减排数据
     */
    CarbonEmission calculateAndSave(Vehicle vehicle, Double distance, Double energyConsumption);
    
    /**
     * 获取车辆的碳减排历史记录
     * @param vehicle 车辆信息
     * @return 碳减排记录列表
     */
    List<CarbonEmission> getVehicleCarbonEmissions(Vehicle vehicle);
    
    /**
     * 获取指定时间范围内的碳减排记录
     * @param vehicle 车辆信息
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 碳减排记录列表
     */
    List<CarbonEmission> getVehicleCarbonEmissionsByTimeRange(
        Vehicle vehicle, LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * 获取车辆的总碳减排量
     * @param vehicle 车辆信息
     * @return 总碳减排量(kgCO2e)
     */
    Double getTotalCarbonReduction(Vehicle vehicle);
    
    /**
     * 获取指定时间范围内的碳减排量
     * @param vehicle 车辆信息
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 碳减排量(kgCO2e)
     */
    Double getCarbonReductionByTimeRange(
        Vehicle vehicle, LocalDateTime startTime, LocalDateTime endTime);
} 