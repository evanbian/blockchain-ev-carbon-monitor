// backend/src/main/java/com/example/evcarbonmonitor/util/CsvUtil.java
package com.example.evcarbonmonitor.util;

import com.example.evcarbonmonitor.dto.VehicleDTO;
import com.example.evcarbonmonitor.exception.ApiException;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

public class CsvUtil {

    /**
     * 解析CSV文件并转换为车辆DTO列表
     */
    public static List<VehicleDTO> parseCsvToVehicles(InputStream inputStream) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT
                     .withFirstRecordAsHeader()
                     .withIgnoreHeaderCase()
                     .withTrim())) {
            
            List<VehicleDTO> vehicles = new ArrayList<>();
            
            for (CSVRecord csvRecord : csvParser) {
                VehicleDTO vehicle = new VehicleDTO();
                
                try {
                    // 设置必填字段
                    vehicle.setVin(getRequiredValue(csvRecord, "vin"));
                    vehicle.setModel(getRequiredValue(csvRecord, "model"));
                    vehicle.setLicensePlate(getRequiredValue(csvRecord, "licensePlate"));
                    vehicle.setManufacturer(getRequiredValue(csvRecord, "manufacturer"));
                    
                    // 设置生产年份
                    String productionYearStr = getRequiredValue(csvRecord, "productionYear");
                    vehicle.setProductionYear(Integer.parseInt(productionYearStr));
                    
                    // 设置电池容量
                    String batteryCapacityStr = getRequiredValue(csvRecord, "batteryCapacity");
                    vehicle.setBatteryCapacity(new BigDecimal(batteryCapacityStr));
                    
                    // 设置最大续航里程
                    String maxRangeStr = getRequiredValue(csvRecord, "maxRange");
                    vehicle.setMaxRange(Integer.parseInt(maxRangeStr));
                    
                    // 设置注册日期
                    String registerDateStr = getRequiredValue(csvRecord, "registerDate");
                    vehicle.setRegisterDate(LocalDate.parse(registerDateStr, DateTimeFormatter.ISO_DATE));
                    
                    // 设置状态
                    String status = csvRecord.get("status");
                    vehicle.setStatus(status != null && !status.isEmpty() ? status : "offline");
                    
                    vehicles.add(vehicle);
                    
                } catch (NumberFormatException e) {
                    throw new ApiException("数值格式不正确: " + e.getMessage());
                } catch (DateTimeParseException e) {
                    throw new ApiException("日期格式不正确，应为YYYY-MM-DD: " + e.getMessage());
                } catch (Exception e) {
                    throw new ApiException("解析记录失败: " + e.getMessage());
                }
            }
            
            return vehicles;
        }
    }
    
    /**
     * 获取必填字段值
     */
    private static String getRequiredValue(CSVRecord record, String fieldName) {
        String value = record.get(fieldName);
        if (value == null || value.trim().isEmpty()) {
            throw new ApiException(fieldName + "不能为空");
        }
        return value.trim();
    }
}
