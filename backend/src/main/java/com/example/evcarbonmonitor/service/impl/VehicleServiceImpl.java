// 添加这行确保文件开头有package声明
package com.example.evcarbonmonitor.service.impl;

import com.example.evcarbonmonitor.domain.Vehicle;
import com.example.evcarbonmonitor.dto.*;
import com.example.evcarbonmonitor.exception.ApiException;
import com.example.evcarbonmonitor.repository.VehicleRepository;
import com.example.evcarbonmonitor.service.VehicleService;
import com.example.evcarbonmonitor.util.CsvUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service // 确保添加了这个注解
public class VehicleServiceImpl implements VehicleService {

    private static final Logger logger = LoggerFactory.getLogger(VehicleServiceImpl.class);
    
    // VIN码正则表达式模式
    private static final Pattern VIN_PATTERN = Pattern.compile("[A-HJ-NPR-Z0-9]{17}");
    
    // 车牌号正则表达式模式
    private static final Pattern LICENSE_PLATE_PATTERN = Pattern.compile("^[\\u4e00-\\u9fa5][A-Z][A-Z0-9]{5}$");

    private final VehicleRepository vehicleRepository;

    @Autowired // 明确声明自动装配
    public VehicleServiceImpl(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    // 以下保持原有的实现代码...
    // 此处省略其余代码以避免重复
    @Override
    public PageResponse<VehicleDTO> getVehicles(VehicleQueryParams params) {
        // 确保页码和每页记录数有效
        int page = Math.max(0, params.getPage() - 1); // Spring Data JPA的页码从0开始
        int size = params.getSize();

        // 构建排序
        Sort sort = Sort.unsorted();
        if (params.getSort() != null && !params.getSort().isEmpty()) {
            sort = "asc".equalsIgnoreCase(params.getOrder()) ?
                   Sort.by(params.getSort()).ascending() :
                   Sort.by(params.getSort()).descending();
        }

        // 构建分页请求
        Pageable pageable = PageRequest.of(page, size, sort);

        // 查询数据
        Page<Vehicle> vehiclePage;
        if (params.getStatus() != null && !params.getStatus().equals("all")) {
            vehiclePage = vehicleRepository.findByStatus(params.getStatus(), pageable);
        } else {
            vehiclePage = vehicleRepository.findByOptionalStatus(null, pageable);
        }

        // 转换为DTO
        List<VehicleDTO> vehicleDTOs = vehiclePage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        // 构建分页响应
        return new PageResponse<>(
                vehiclePage.getTotalElements(),
                params.getPage(),
                size,
                vehicleDTOs
        );
    }

    @Override
    public VehicleDTO getVehicleByVin(String vin) {
        Vehicle vehicle = vehicleRepository.findById(vin)
                .orElseThrow(() -> new ApiException(404, "车辆不存在"));
        return convertToDTO(vehicle);
    }

    @Override
    @Transactional
    public String createVehicle(VehicleDTO vehicleDTO) {
        // 验证VIN码
        if (!VIN_PATTERN.matcher(vehicleDTO.getVin()).matches()) {
            throw new ApiException(400, "VIN码格式不正确");
        }

        // 验证车牌号
        if (!LICENSE_PLATE_PATTERN.matcher(vehicleDTO.getLicensePlate()).matches()) {
            throw new ApiException(400, "车牌号格式不正确");
        }

        // 检查VIN码是否已存在
        if (vehicleRepository.existsById(vehicleDTO.getVin())) {
            throw new ApiException(409, "VIN码已存在");
        }

        // 检查车牌号是否已存在
        if (vehicleRepository.existsByLicensePlate(vehicleDTO.getLicensePlate())) {
            throw new ApiException(409, "车牌号已存在");
        }

        // 创建新车辆
        Vehicle vehicle = convertToEntity(vehicleDTO);
        vehicle.setLastUpdateTime(LocalDateTime.now());
        vehicle.setCreatedAt(LocalDateTime.now());
        vehicle.setUpdatedAt(LocalDateTime.now());
        
        // 初始化统计数据
        // 这些数据在实际项目中可能会从其他表中计算得出
        
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return savedVehicle.getVin();
    }

    @Override
    @Transactional
    public String updateVehicle(String vin, VehicleDTO vehicleDTO) {
        // 检查车辆是否存在
        Vehicle existingVehicle = vehicleRepository.findById(vin)
                .orElseThrow(() -> new ApiException(404, "车辆不存在"));

        // 如果更新了车牌号，检查新车牌号是否已被其他车辆使用
        if (vehicleDTO.getLicensePlate() != null && 
            !vehicleDTO.getLicensePlate().equals(existingVehicle.getLicensePlate())) {
            
            if (vehicleRepository.existsByLicensePlate(vehicleDTO.getLicensePlate())) {
                throw new ApiException(409, "车牌号已存在");
            }
            
            existingVehicle.setLicensePlate(vehicleDTO.getLicensePlate());
        }

        // 更新车辆信息
        if (vehicleDTO.getModel() != null) {
            existingVehicle.setModel(vehicleDTO.getModel());
        }
        
        if (vehicleDTO.getManufacturer() != null) {
            existingVehicle.setManufacturer(vehicleDTO.getManufacturer());
        }
        
        if (vehicleDTO.getProductionYear() != null) {
            existingVehicle.setProductionYear(vehicleDTO.getProductionYear());
        }
        
        if (vehicleDTO.getBatteryCapacity() != null) {
            existingVehicle.setBatteryCapacity(vehicleDTO.getBatteryCapacity());
        }
        
        if (vehicleDTO.getMaxRange() != null) {
            existingVehicle.setMaxRange(vehicleDTO.getMaxRange());
        }
        
        if (vehicleDTO.getRegisterDate() != null) {
            existingVehicle.setRegisterDate(vehicleDTO.getRegisterDate());
        }
        
        if (vehicleDTO.getStatus() != null) {
            existingVehicle.setStatus(vehicleDTO.getStatus());
        }

        // 更新时间
        existingVehicle.setLastUpdateTime(LocalDateTime.now());
        existingVehicle.setUpdatedAt(LocalDateTime.now());

        Vehicle updatedVehicle = vehicleRepository.save(existingVehicle);
        return updatedVehicle.getVin();
    }

    @Override
    @Transactional
    public void deleteVehicle(String vin) {
        // 检查车辆是否存在
        if (!vehicleRepository.existsById(vin)) {
            throw new ApiException(404, "车辆不存在");
        }
        
        // 删除车辆
        vehicleRepository.deleteById(vin);
    }

    @Override
    @Transactional
    public BatchImportResponse importVehicles(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(400, "文件不能为空");
        }

        // 检查文件类型
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.endsWith(".csv")) {
            throw new ApiException(400, "仅支持CSV文件格式");
        }

        try {
            // 解析CSV文件
            List<VehicleDTO> vehicleDTOs = CsvUtil.parseCsvToVehicles(file.getInputStream());
            
            // 存储导入结果
            BatchImportResponse response = new BatchImportResponse();
            response.setTotal(vehicleDTOs.size());
            
            List<BatchImportResponse.FailureRecord> failures = new ArrayList<>();
            List<VehicleDTO> newVehicles = new ArrayList<>();
            
            int successCount = 0;
            
            // 处理每一条记录
            for (int i = 0; i < vehicleDTOs.size(); i++) {
                VehicleDTO dto = vehicleDTOs.get(i);
                int lineNum = i + 2; // CSV头部占一行，所以行号从2开始
                
                try {
                    // 验证并创建车辆
                    if (!VIN_PATTERN.matcher(dto.getVin()).matches()) {
                        throw new ApiException("VIN码格式不正确");
                    }
                    
                    if (!LICENSE_PLATE_PATTERN.matcher(dto.getLicensePlate()).matches()) {
                        throw new ApiException("车牌号格式不正确");
                    }
                    
                    // 检查VIN码是否已存在
                    if (vehicleRepository.existsById(dto.getVin())) {
                        throw new ApiException("VIN码已存在");
                    }
                    
                    // 检查车牌号是否已存在
                    if (vehicleRepository.existsByLicensePlate(dto.getLicensePlate())) {
                        throw new ApiException("车牌号已存在");
                    }
                    
                    // 创建车辆
                    Vehicle vehicle = convertToEntity(dto);
                    vehicle.setLastUpdateTime(LocalDateTime.now());
                    vehicle.setCreatedAt(LocalDateTime.now());
                    vehicle.setUpdatedAt(LocalDateTime.now());
                    
                    Vehicle savedVehicle = vehicleRepository.save(vehicle);
                    
                    // 添加到成功导入的列表
                    VehicleDTO savedDto = convertToDTO(savedVehicle);
                    newVehicles.add(savedDto);
                    successCount++;
                    
                } catch (Exception e) {
                    // 记录失败原因
                    BatchImportResponse.FailureRecord failureRecord = 
                        new BatchImportResponse.FailureRecord(
                            lineNum,
                            dto.getVin(),
                            e.getMessage()
                        );
                    failures.add(failureRecord);
                }
            }
            
            // 设置导入结果
            response.setSuccess(successCount);
            response.setFailed(vehicleDTOs.size() - successCount);
            response.setFailures(failures);
            response.setNewVehicles(newVehicles);
            
            return response;
            
        } catch (Exception e) {
            logger.error("导入车辆失败", e);
            throw new ApiException(500, "导入车辆失败: " + e.getMessage());
        }
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
    
    /**
     * 将DTO转换为实体对象
     */
    private Vehicle convertToEntity(VehicleDTO dto) {
        Vehicle vehicle = new Vehicle();
        BeanUtils.copyProperties(dto, vehicle);
        return vehicle;
    }
}
