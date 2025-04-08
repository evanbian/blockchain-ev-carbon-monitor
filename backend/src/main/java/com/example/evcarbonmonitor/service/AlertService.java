package com.example.evcarbonmonitor.service;

import com.example.evcarbonmonitor.dto.AlertDTO;
import com.example.evcarbonmonitor.dto.AlertQueryCriteria;
import com.example.evcarbonmonitor.dto.AlertUpdateStatusDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for managing Alerts.
 */
public interface AlertService {

    /**
     * Retrieves a paginated list of alerts based on the provided criteria.
     *
     * @param criteria The filtering criteria.
     * @param pageable Pagination information.
     * @return A page of AlertDTOs.
     */
    Page<AlertDTO> getAlerts(AlertQueryCriteria criteria, Pageable pageable);

    /**
     * Retrieves a single alert by its ID.
     *
     * @param id The ID of the alert.
     * @return The AlertDTO.
     * @throws com.example.evcarbonmonitor.exception.ResourceNotFoundException if the alert is not found.
     */
    AlertDTO getAlertById(String id);

    /**
     * Updates the status of an existing alert.
     *
     * @param id The ID of the alert to update.
     * @param updateStatusDTO DTO containing the new status and optional comment.
     * @return The updated AlertDTO.
     * @throws com.example.evcarbonmonitor.exception.ResourceNotFoundException if the alert is not found.
     */
    AlertDTO updateAlertStatus(String id, AlertUpdateStatusDTO updateStatusDTO);
    
    // Potential future methods:
    // void createAlert(AlertCreateDTO createDTO);
    // void deleteAlert(String id);
} 