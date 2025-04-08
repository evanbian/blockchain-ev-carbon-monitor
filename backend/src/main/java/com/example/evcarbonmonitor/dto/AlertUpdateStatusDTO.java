package com.example.evcarbonmonitor.dto;

import com.example.evcarbonmonitor.domain.AlertStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Data Transfer Object for updating Alert status.
 */
@Data
public class AlertUpdateStatusDTO {

    @NotNull(message = "Status cannot be null")
    private AlertStatus status;

    private String comment;
} 