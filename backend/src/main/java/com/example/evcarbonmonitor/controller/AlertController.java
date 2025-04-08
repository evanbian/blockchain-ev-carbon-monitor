package com.example.evcarbonmonitor.controller;

import com.example.evcarbonmonitor.dto.AlertDTO;
import com.example.evcarbonmonitor.dto.AlertQueryCriteria;
import com.example.evcarbonmonitor.dto.AlertUpdateStatusDTO;
import com.example.evcarbonmonitor.dto.ApiResponse;
import com.example.evcarbonmonitor.service.AlertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    /**
     * GET /api/v1/alerts : Get a paginated list of alerts with filtering.
     *
     * @param criteria Query parameters for filtering.
     * @param pageable Pagination information.
     * @return ApiResponse containing a Page of AlertDTOs.
     */
    @GetMapping
    public ApiResponse<Page<AlertDTO>> getAlerts(
            AlertQueryCriteria criteria, 
            @PageableDefault(size = 10, sort = "alertTime,desc") Pageable pageable) {
        Page<AlertDTO> alertPage = alertService.getAlerts(criteria, pageable);
        return ApiResponse.success(alertPage);
    }

    /**
     * GET /api/v1/alerts/{id} : Get a single alert by ID.
     *
     * @param id The ID of the alert.
     * @return ApiResponse containing the AlertDTO.
     */
    @GetMapping("/{id}")
    public ApiResponse<AlertDTO> getAlertById(@PathVariable String id) {
        AlertDTO alertDTO = alertService.getAlertById(id);
        return ApiResponse.success(alertDTO);
    }

    /**
     * PUT /api/v1/alerts/{id}/status : Update the status of an alert.
     *
     * @param id The ID of the alert to update.
     * @param updateStatusDTO The request body containing the new status and comment.
     * @return ApiResponse containing the updated AlertDTO.
     */
    @PutMapping("/{id}/status")
    public ApiResponse<AlertDTO> updateAlertStatus(
            @PathVariable String id, 
            @Valid @RequestBody AlertUpdateStatusDTO updateStatusDTO) {
        AlertDTO updatedAlertDTO = alertService.updateAlertStatus(id, updateStatusDTO);
        return ApiResponse.success(updatedAlertDTO);
    }
} 