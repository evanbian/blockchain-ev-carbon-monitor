package com.example.evcarbonmonitor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Represents summary driving data for a vehicle over a period.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DrivingData {
    private BigDecimal totalMileage;     // km
    private BigDecimal totalEnergy;      // kWh
    private BigDecimal totalCarbonReduction; // kgCO2e
    private BigDecimal averageEfficiency; // kWh/100km
}