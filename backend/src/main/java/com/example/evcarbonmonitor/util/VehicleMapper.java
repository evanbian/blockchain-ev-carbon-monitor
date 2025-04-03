package com.example.evcarbonmonitor.util;

import com.example.evcarbonmonitor.domain.Vehicle;
import com.example.evcarbonmonitor.dto.VehicleDTO;
import org.springframework.stereotype.Component;

@Component
public class VehicleMapper {

    /**
     * 将 VehicleDTO 转换为 Vehicle 实体
     * @param dto 车辆DTO
     * @return 车辆实体
     */
    public Vehicle toEntity(VehicleDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Vehicle vehicle = new Vehicle();
        vehicle.setVin(dto.getVin());
        vehicle.setLicensePlate(dto.getLicensePlate());
        vehicle.setManufacturer(dto.getManufacturer());
        vehicle.setModel(dto.getModel());
        vehicle.setProductionYear(dto.getProductionYear());
        vehicle.setBatteryCapacity(dto.getBatteryCapacity());
        vehicle.setMaxRange(dto.getMaxRange());
        vehicle.setRegisterDate(dto.getRegisterDate());
        vehicle.setStatus(dto.getStatus());
        
        return vehicle;
    }

    /**
     * 将 Vehicle 实体转换为 VehicleDTO
     * @param entity 车辆实体
     * @return 车辆DTO
     */
    public VehicleDTO toDTO(Vehicle entity) {
        if (entity == null) {
            return null;
        }
        
        VehicleDTO dto = new VehicleDTO();
        dto.setVin(entity.getVin());
        dto.setLicensePlate(entity.getLicensePlate());
        dto.setManufacturer(entity.getManufacturer());
        dto.setModel(entity.getModel());
        dto.setProductionYear(entity.getProductionYear());
        dto.setBatteryCapacity(entity.getBatteryCapacity());
        dto.setMaxRange(entity.getMaxRange());
        dto.setRegisterDate(entity.getRegisterDate());
        dto.setStatus(entity.getStatus());
        dto.setLastUpdateTime(entity.getLastUpdateTime());
        
        return dto;
    }
} 