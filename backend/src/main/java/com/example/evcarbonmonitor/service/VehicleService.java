// backend/src/main/java/com/example/evcarbonmonitor/service/VehicleService.java
package com.example.evcarbonmonitor.service;

import com.example.evcarbonmonitor.dto.*;
import org.springframework.web.multipart.MultipartFile;

public interface VehicleService {

    /**
     * 获取车辆列表
     * @param params 查询参数
     * @return 分页车辆列表
     */
    PageResponse<VehicleDTO> getVehicles(VehicleQueryParams params);

    /**
     * 获取车辆详情
     * @param vin 车辆VIN码
     * @return 车辆详情
     */
    VehicleDTO getVehicleByVin(String vin);

    /**
     * 创建车辆
     * @param vehicleDTO 车辆信息
     * @return 创建的车辆VIN码
     */
    String createVehicle(VehicleDTO vehicleDTO);

    /**
     * 更新车辆信息
     * @param vin 车辆VIN码
     * @param vehicleDTO 要更新的车辆信息
     * @return 更新的车辆VIN码
     */
    String updateVehicle(String vin, VehicleDTO vehicleDTO);

    /**
     * 删除车辆
     * @param vin 车辆VIN码
     */
    void deleteVehicle(String vin);

    /**
     * 批量导入车辆
     * @param file CSV文件
     * @return 导入结果
     */
    BatchImportResponse importVehicles(MultipartFile file);
}
