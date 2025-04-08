package com.example.evcarbonmonitor.service.impl;

import com.example.evcarbonmonitor.domain.Alert;
import com.example.evcarbonmonitor.domain.AlertLevel;
import com.example.evcarbonmonitor.domain.AlertStatus;
import com.example.evcarbonmonitor.domain.Vehicle;
import com.example.evcarbonmonitor.dto.AlertDTO;
import com.example.evcarbonmonitor.dto.AlertQueryCriteria;
import com.example.evcarbonmonitor.dto.AlertUpdateStatusDTO;
import com.example.evcarbonmonitor.exception.ResourceNotFoundException;
import com.example.evcarbonmonitor.repository.AlertRepository;
import com.example.evcarbonmonitor.repository.VehicleRepository;
import com.example.evcarbonmonitor.service.AlertService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AlertServiceImpl implements AlertService {

    private final AlertRepository alertRepository;
    private final VehicleRepository vehicleRepository; // Inject VehicleRepository to fetch vehicle details

    @Override
    @Transactional(readOnly = true) // Read-only transaction for fetching data
    public Page<AlertDTO> getAlerts(AlertQueryCriteria criteria, Pageable pageable) {
        
        Specification<Alert> spec = buildSpecification(criteria);
        Page<Alert> alertPage = alertRepository.findAll(spec, pageable);
        
        // Convert Page<Alert> to Page<AlertDTO>
        return alertPage.map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public AlertDTO getAlertById(String id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert", id));
        return mapToDTO(alert);
    }

    @Override
    @Transactional // Read-write transaction for update
    public AlertDTO updateAlertStatus(String id, AlertUpdateStatusDTO updateStatusDTO) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert", id));

        alert.setStatus(updateStatusDTO.getStatus());
        if (StringUtils.hasText(updateStatusDTO.getComment())) {
            alert.setComment(updateStatusDTO.getComment());
        }
        // Assuming updatedAt field exists or auditing handles it
        // alert.setUpdatedAt(LocalDateTime.now());
        
        Alert updatedAlert = alertRepository.save(alert);
        return mapToDTO(updatedAlert);
    }

    // --- Helper Methods ---

    /**
     * Builds the JPA Specification based on the query criteria.
     * (Isolation Test 1: Only VIN filter enabled)
     */
    private Specification<Alert> buildSpecification(AlertQueryCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // --- ISOLATION STEP 1: Only VIN filter --- 
            if (StringUtils.hasText(criteria.getVin())) {
                predicates.add(cb.equal(root.get("vin"), criteria.getVin()));
            }
            
            // --- Temporarily Commented Out --- 
            /*
            // Check Level 
            if (criteria.getLevel() != null) {
                AlertLevel level = criteria.getLevel();
                if (level != null) { 
                     predicates.add(cb.equal(root.get("level"), level));
                }
            }
            
            // Check Status 
            if (criteria.getStatus() != null) {
                 AlertStatus status = criteria.getStatus();
                 if (status != null) { 
                    predicates.add(cb.equal(root.get("status"), status));
                 }
            }
            
            // Check Start Date
            if (criteria.getStartDate() != null) {
                 LocalDateTime startDateTime = criteria.getStartDate().atStartOfDay();
                 if (startDateTime != null) { 
                    predicates.add(cb.greaterThanOrEqualTo(root.get("alertTime"), startDateTime));
                 }
            }
            
            // Check End Date
             if (criteria.getEndDate() != null) {
                 LocalDateTime endDateTime = criteria.getEndDate().plusDays(1).atStartOfDay();
                  if (endDateTime != null) { 
                    predicates.add(cb.lessThan(root.get("alertTime"), endDateTime));
                  }
            }
            */
            // --- End of Temporarily Commented Out ---
            
            // Check Level (Compare Enum Name String)
            if (criteria.getLevel() != null) {
                AlertLevel level = criteria.getLevel();
                if (level != null) { 
                     // Compare the string representation stored in the DB
                     predicates.add(cb.equal(root.get("level").as(String.class), level.name()));
                }
            }
            
            // Check Status (Compare Enum Name String)
            if (criteria.getStatus() != null) {
                 AlertStatus status = criteria.getStatus();
                 if (status != null) { 
                    // Compare the string representation stored in the DB
                    predicates.add(cb.equal(root.get("status").as(String.class), status.name()));
                 }
            }
            
            // Check Start Date
            if (criteria.getStartDate() != null) {
                 LocalDateTime startDateTime = criteria.getStartDate().atStartOfDay();
                 if (startDateTime != null) { 
                    predicates.add(cb.greaterThanOrEqualTo(root.get("alertTime"), startDateTime));
                 }
            }
            
            // Check End Date
             if (criteria.getEndDate() != null) {
                 LocalDateTime endDateTime = criteria.getEndDate().plusDays(1).atStartOfDay();
                  if (endDateTime != null) { 
                    predicates.add(cb.lessThan(root.get("alertTime"), endDateTime));
                  }
            }
            
            // Combine predicates with AND
            if (predicates.isEmpty()) {
                return cb.conjunction(); 
            } else {
                return cb.and(predicates.toArray(new Predicate[0]));
            }
        };
    }

    /**
     * Maps an Alert entity to an AlertDTO, fetching associated Vehicle details.
     */
    private AlertDTO mapToDTO(Alert alert) {
        AlertDTO dto = new AlertDTO();
        dto.setId(alert.getId());
        dto.setVin(alert.getVin());
        dto.setType(alert.getType());
        dto.setLevel(alert.getLevel());
        dto.setMessage(alert.getMessage());
        dto.setDetail(alert.getDetail());
        dto.setTime(alert.getAlertTime()); // Map alertTime to DTO's time field
        dto.setStatus(alert.getStatus());
        dto.setRelatedData(alert.getRelatedData());
        dto.setComment(alert.getComment());
        dto.setCreatedAt(alert.getCreatedAt());
        
        // Fetch and map vehicle details (licensePlate, model)
        if (StringUtils.hasText(alert.getVin())) {
             Optional<Vehicle> vehicleOpt = vehicleRepository.findById(alert.getVin());
             vehicleOpt.ifPresent(vehicle -> {
                 dto.setLicensePlate(vehicle.getLicensePlate());
                 dto.setModel(vehicle.getModel());
             });
             // Consider logging a warning if vehicle not found for an alert VIN
        }
        
        return dto;
    }
} 