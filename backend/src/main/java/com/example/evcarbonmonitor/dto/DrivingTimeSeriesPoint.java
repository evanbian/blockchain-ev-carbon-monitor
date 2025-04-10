package com.example.evcarbonmonitor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Represents a single data point in a vehicle's driving/energy time series.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DrivingTimeSeriesPoint {
    private String date; // Format depends on groupBy (e.g., YYYY-MM-DD)
    private BigDecimal mileage; // km
    private BigDecimal energy; // kWh
    private BigDecimal carbonReduction; // kgCO2e
    private BigDecimal energyPer100km; // kWh/100km (calculated)
}