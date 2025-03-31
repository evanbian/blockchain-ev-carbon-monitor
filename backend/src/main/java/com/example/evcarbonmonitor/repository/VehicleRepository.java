package com.example.evcarbonmonitor.repository;

import com.example.evcarbonmonitor.domain.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, String> {

    Optional<Vehicle> findByLicensePlate(String licensePlate);

    boolean existsByLicensePlate(String licensePlate);

    Page<Vehicle> findByStatus(String status, Pageable pageable);

    @Query("SELECT v FROM Vehicle v WHERE (:status IS NULL OR v.status = :status)")
    Page<Vehicle> findByOptionalStatus(@Param("status") String status, Pageable pageable);
    
    // 添加一个简单的查询方法，确保能获取所有车辆
    @Query("SELECT v FROM Vehicle v ORDER BY v.vin")
    List<Vehicle> findAllVehiclesOrdered();
}