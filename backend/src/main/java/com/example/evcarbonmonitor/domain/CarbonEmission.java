package com.example.evcarbonmonitor.domain;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "carbon_emissions")
@EntityListeners(AuditingEntityListener.class)
public class CarbonEmission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(nullable = false)
    private Double distance; // 行驶距离(km)

    @Column(nullable = false)
    private Double energyConsumption; // 能耗(kWh)

    @Column(nullable = false)
    private Double carbonEmission; // 碳排放量(kgCO2e)

    @Column(nullable = false)
    private Double carbonReduction; // 碳减排量(kgCO2e)

    @Column
    private Double latitude; // 纬度

    @Column
    private Double longitude; // 经度

    @Column(nullable = false)
    private LocalDateTime calculationTime; // 计算时间

    @Column(length = 50)
    private String calculationMethod; // 计算方法

    @Column(length = 500)
    private String remarks; // 备注

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
} 