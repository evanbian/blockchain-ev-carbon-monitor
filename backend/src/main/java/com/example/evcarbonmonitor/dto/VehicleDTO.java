// backend/src/main/java/com/example/evcarbonmonitor/dto/VehicleDTO.java
package com.example.evcarbonmonitor.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class VehicleDTO {

    // 用于创建和更新的字段
    @Pattern(regexp = "[A-HJ-NPR-Z0-9]{17}", message = "VIN码格式不正确")
    private String vin;

    @NotBlank(message = "车型不能为空")
    @Size(max = 100, message = "车型长度不能超过100个字符")
    private String model;

    @NotBlank(message = "车牌号不能为空")
    @Pattern(regexp = "^[\\u4e00-\\u9fa5][A-Z][A-Z0-9]{5}$", message = "车牌号格式不正确")
    private String licensePlate;

    @NotBlank(message = "制造商不能为空")
    @Size(max = 100, message = "制造商长度不能超过100个字符")
    private String manufacturer;

    @NotNull(message = "生产年份不能为空")
    @Min(value = 2000, message = "生产年份不能早于2000年")
    @Max(value = 2100, message = "生产年份不能晚于2100年")
    private Integer productionYear;

    @NotNull(message = "电池容量不能为空")
    @DecimalMin(value = "0.0", inclusive = false, message = "电池容量必须大于0")
    @Digits(integer = 8, fraction = 2, message = "电池容量格式不正确")
    private BigDecimal batteryCapacity;

    @NotNull(message = "最大续航里程不能为空")
    @Min(value = 0, message = "最大续航里程不能小于0")
    private Integer maxRange;

    @NotNull(message = "注册日期不能为空")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate registerDate;

    @NotBlank(message = "状态不能为空")
    @Pattern(regexp = "^(online|offline|error)$", message = "状态只能是online、offline或error")
    private String status;

    // 只用于返回的字段
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastUpdateTime;

    private BigDecimal totalMileage;
    private BigDecimal totalEnergy;
    private BigDecimal totalCarbonReduction;
    private BigDecimal carbonCredits;

    // 构造函数
    public VehicleDTO() {
    }

    // Getters and Setters
    public String getVin() {
        return vin;
    }

    public void setVin(String vin) {
        this.vin = vin;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public Integer getProductionYear() {
        return productionYear;
    }

    public void setProductionYear(Integer productionYear) {
        this.productionYear = productionYear;
    }

    public BigDecimal getBatteryCapacity() {
        return batteryCapacity;
    }

    public void setBatteryCapacity(BigDecimal batteryCapacity) {
        this.batteryCapacity = batteryCapacity;
    }

    public Integer getMaxRange() {
        return maxRange;
    }

    public void setMaxRange(Integer maxRange) {
        this.maxRange = maxRange;
    }

    public LocalDate getRegisterDate() {
        return registerDate;
    }

    public void setRegisterDate(LocalDate registerDate) {
        this.registerDate = registerDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getLastUpdateTime() {
        return lastUpdateTime;
    }

    public void setLastUpdateTime(LocalDateTime lastUpdateTime) {
        this.lastUpdateTime = lastUpdateTime;
    }

    public BigDecimal getTotalMileage() {
        return totalMileage;
    }

    public void setTotalMileage(BigDecimal totalMileage) {
        this.totalMileage = totalMileage;
    }

    public BigDecimal getTotalEnergy() {
        return totalEnergy;
    }

    public void setTotalEnergy(BigDecimal totalEnergy) {
        this.totalEnergy = totalEnergy;
    }

    public BigDecimal getTotalCarbonReduction() {
        return totalCarbonReduction;
    }

    public void setTotalCarbonReduction(BigDecimal totalCarbonReduction) {
        this.totalCarbonReduction = totalCarbonReduction;
    }

    public BigDecimal getCarbonCredits() {
        return carbonCredits;
    }

    public void setCarbonCredits(BigDecimal carbonCredits) {
        this.carbonCredits = carbonCredits;
    }
}
