package com.example.evcarbonmonitor.dto;

import com.example.evcarbonmonitor.domain.AlertLevel;
import com.example.evcarbonmonitor.domain.AlertStatus;
import com.example.evcarbonmonitor.domain.AlertType;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Alert information.
 */
@Data
public class AlertDTO {
    private String id;
    private String vin;
    private String licensePlate; // 车牌号 (from Vehicle)
    private String model;        // 车型 (from Vehicle)
    private AlertType type;
    private AlertLevel level;
    private String message;
    private String detail;
    private LocalDateTime time; // Corresponds to alertTime in entity
    private AlertStatus status;
    private String relatedData; // Keep as JSON string for simplicity in DTO
    private String comment;
    private LocalDateTime createdAt;
} 