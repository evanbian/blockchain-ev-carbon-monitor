package com.example.evcarbonmonitor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a single data point for heatmap visualization.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HeatmapDataPoint {
    private double lat; // Latitude
    private double lng; // Longitude
    private double count; // Weight value (e.g., frequency, duration, intensity)
}