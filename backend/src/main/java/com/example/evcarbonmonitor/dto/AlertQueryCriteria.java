package com.example.evcarbonmonitor.dto;

import com.example.evcarbonmonitor.domain.AlertLevel;
import com.example.evcarbonmonitor.domain.AlertStatus;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

/**
 * Data Transfer Object for Alert query criteria.
 */
@Data
public class AlertQueryCriteria {
    private String vin;
    private AlertLevel level;
    private AlertStatus status;
    
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) // Expect YYYY-MM-DD
    private LocalDate startDate;
    
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDate;
    
    // Pagination parameters (usually handled by Pageable in controller)
    // private Integer page = 0; // Default to page 0 for Spring Pageable
    // private Integer size = 10; // Default page size
} 