package com.example.evcarbonmonitor.controller;

import com.example.evcarbonmonitor.domain.Vehicle;
import com.example.evcarbonmonitor.dto.*;
import com.example.evcarbonmonitor.repository.VehicleRepository;
import com.example.evcarbonmonitor.service.VehicleService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/vehicles")
public class VehicleController {

    private static final Logger logger = LoggerFactory.getLogger(VehicleController.class);
    
    private final VehicleService vehicleService;
    
    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    /**
     * 获取车辆列表
     */
    @GetMapping
    public ApiResponse<PageResponse<VehicleDTO>> getVehicles(VehicleQueryParams params) {
        logger.info("Received request to get vehicles with params: {}", params);
        PageResponse<VehicleDTO> pageResponse = vehicleService.getVehicles(params);
        
        // 详细日志
        logger.info("Returning vehicles - total: {}, page: {}, size: {}, items count: {}", 
            pageResponse.getTotal(), pageResponse.getPage(), pageResponse.getSize(), 
            pageResponse.getItems().size());
        
        if (!pageResponse.getItems().isEmpty()) {
            for (VehicleDTO vehicle : pageResponse.getItems()) {
                logger.info("Vehicle in response: VIN={}, Model={}, Status={}", 
                    vehicle.getVin(), vehicle.getModel(), vehicle.getStatus());
            }
        } else {
            logger.warn("No vehicles found in database for the query");
        }
        
        return ApiResponse.success(pageResponse);
    }

    /**
     * 获取车辆详情
     */
    @GetMapping("/{vin}")
    public ApiResponse<VehicleDTO> getVehicleByVin(@PathVariable String vin) {
        logger.info("Received request to get vehicle with VIN: {}", vin);
        VehicleDTO vehicle = vehicleService.getVehicleByVin(vin);
        return ApiResponse.success(vehicle);
    }

    /**
     * 添加车辆
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Map<String, String>> createVehicle(@Valid @RequestBody VehicleDTO vehicleDTO) {
        logger.info("Received request to create vehicle: {}", vehicleDTO);
        String vin = vehicleService.createVehicle(vehicleDTO);
        
        Map<String, String> response = new HashMap<>();
        response.put("vin", vin);
        
        return ApiResponse.success("车辆添加成功", response);
    }

    /**
     * 更新车辆信息
     */
    @PutMapping("/{vin}")
    public ApiResponse<Map<String, String>> updateVehicle(
            @PathVariable String vin,
            @Valid @RequestBody VehicleDTO vehicleDTO) {
        
        logger.info("Received request to update vehicle with VIN {}: {}", vin, vehicleDTO);
        String updatedVin = vehicleService.updateVehicle(vin, vehicleDTO);
        
        Map<String, String> response = new HashMap<>();
        response.put("vin", updatedVin);
        
        return ApiResponse.success("更新成功", response);
    }

    /**
     * 删除车辆
     */
    @DeleteMapping("/{vin}")
    public ApiResponse<Void> deleteVehicle(@PathVariable String vin) {
        logger.info("Received request to delete vehicle with VIN: {}", vin);
        vehicleService.deleteVehicle(vin);
        return ApiResponse.success("删除成功", null);
    }

    /**
     * 批量导入车辆
     */
    @PostMapping("/batch")
    public ApiResponse<BatchImportResponse> importVehicles(@RequestParam("file") MultipartFile file) {
        logger.info("Received request to import vehicles from file: {}", file.getOriginalFilename());
        BatchImportResponse response = vehicleService.importVehicles(file);
        return ApiResponse.success("批量导入成功", response);
    }
    
    /**
     * 调试接口：获取所有车辆
     */
    @GetMapping("/debug/all")
    public ApiResponse<List<VehicleDTO>> getAllVehiclesDebug() {
        logger.info("Debug: getting all vehicles directly");
        
        List<Vehicle> vehicles = vehicleRepository.findAllVehiclesOrdered();
        
        List<VehicleDTO> vehicleDTOs = vehicles.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        
        logger.info("Debug: found {} vehicles", vehicleDTOs.size());
        
        return ApiResponse.success(vehicleDTOs);
    }
    
    /**
     * 将实体对象转换为DTO
     */
    private VehicleDTO convertToDTO(Vehicle vehicle) {
        VehicleDTO dto = new VehicleDTO();
        BeanUtils.copyProperties(vehicle, dto);
        
        // 设置统计数据，实际项目中可能会从其他表中查询
        // 这里使用模拟数据
        dto.setTotalMileage(BigDecimal.valueOf(12500));
        dto.setTotalEnergy(BigDecimal.valueOf(2300));
        dto.setTotalCarbonReduction(BigDecimal.valueOf(3750.5));
        dto.setCarbonCredits(BigDecimal.valueOf(187.5));
        
        return dto;
    }
}