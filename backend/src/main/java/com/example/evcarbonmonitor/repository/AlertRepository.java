package com.example.evcarbonmonitor.repository;

import com.example.evcarbonmonitor.domain.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface AlertRepository extends JpaRepository<Alert, String>, JpaSpecificationExecutor<Alert> {
    // JpaRepository provides basic CRUD methods (save, findById, findAll, deleteById, etc.)
    // JpaSpecificationExecutor provides methods for executing Specifications (findAll(Specification<T> spec, Pageable pageable))
    
    // We can add custom query methods here if needed later, 
    // but Specification executor is often sufficient for complex filtering.
} 