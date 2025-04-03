package com.example.evcarbonmonitor.controller;

import com.example.evcarbonmonitor.domain.CarbonEmission;
import com.example.evcarbonmonitor.domain.Vehicle;
import com.example.evcarbonmonitor.dto.VehicleDTO;
import com.example.evcarbonmonitor.service.CarbonEmissionService;
import com.example.evcarbonmonitor.service.VehicleService;
import com.example.evcarbonmonitor.util.VehicleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/carbon-emissions")
@RequiredArgsConstructor
public class CarbonEmissionController {

    private final CarbonEmissionService carbonEmissionService;
    private final VehicleService vehicleService;
    private final VehicleMapper vehicleMapper;

    @PostMapping("/vehicles/{vehicleVin}/calculate")
    public ResponseEntity<CarbonEmission> calculateCarbonEmission(
            @PathVariable String vehicleVin,
            @RequestParam Double distance,
            @RequestParam Double energyConsumption) {
        VehicleDTO vehicleDTO = vehicleService.getVehicleByVin(vehicleVin);
        Vehicle vehicle = vehicleMapper.toEntity(vehicleDTO);
        CarbonEmission result = carbonEmissionService.calculateAndSave(vehicle, distance, energyConsumption);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/vehicles/{vehicleVin}")
    public ResponseEntity<List<CarbonEmission>> getVehicleCarbonEmissions(
            @PathVariable String vehicleVin) {
        VehicleDTO vehicleDTO = vehicleService.getVehicleByVin(vehicleVin);
        Vehicle vehicle = vehicleMapper.toEntity(vehicleDTO);
        List<CarbonEmission> emissions = carbonEmissionService.getVehicleCarbonEmissions(vehicle);
        return ResponseEntity.ok(emissions);
    }

    @GetMapping("/vehicles/{vehicleVin}/time-range")
    public ResponseEntity<List<CarbonEmission>> getVehicleCarbonEmissionsByTimeRange(
            @PathVariable String vehicleVin,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        VehicleDTO vehicleDTO = vehicleService.getVehicleByVin(vehicleVin);
        Vehicle vehicle = vehicleMapper.toEntity(vehicleDTO);
        List<CarbonEmission> emissions = carbonEmissionService.getVehicleCarbonEmissionsByTimeRange(
                vehicle, startTime, endTime);
        return ResponseEntity.ok(emissions);
    }

    @GetMapping("/vehicles/{vehicleVin}/total-reduction")
    public ResponseEntity<Double> getTotalCarbonReduction(
            @PathVariable String vehicleVin) {
        VehicleDTO vehicleDTO = vehicleService.getVehicleByVin(vehicleVin);
        Vehicle vehicle = vehicleMapper.toEntity(vehicleDTO);
        Double totalReduction = carbonEmissionService.getTotalCarbonReduction(vehicle);
        return ResponseEntity.ok(totalReduction);
    }

    @GetMapping("/vehicles/{vehicleVin}/time-range-reduction")
    public ResponseEntity<Double> getCarbonReductionByTimeRange(
            @PathVariable String vehicleVin,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        VehicleDTO vehicleDTO = vehicleService.getVehicleByVin(vehicleVin);
        Vehicle vehicle = vehicleMapper.toEntity(vehicleDTO);
        Double reduction = carbonEmissionService.getCarbonReductionByTimeRange(
                vehicle, startTime, endTime);
        return ResponseEntity.ok(reduction);
    }
} 