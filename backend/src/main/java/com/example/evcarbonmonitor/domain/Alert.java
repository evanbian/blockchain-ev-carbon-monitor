package com.example.evcarbonmonitor.domain;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator; // For UUID generation
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "alerts")
@EntityListeners(AuditingEntityListener.class)
public class Alert {

    @Id
    @GeneratedValue(generator = "uuid2") // Use UUID for ID
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(columnDefinition = "VARCHAR(36)")
    private String id;

    // Simplify mapping: Remove explicit column name, let JPA use default 'vin'
    // Ensure database column is named 'vin'
    @Column(nullable = false) 
    private String vin;

    @Enumerated(EnumType.STRING) // Store enum name as string
    @Column(nullable = false)
    private AlertType type; // 告警类型

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertLevel level; // 告警级别

    @Column(nullable = false, length = 500)
    private String message; // 告警消息 (简洁)

    @Column(columnDefinition = "TEXT") // Use TEXT for potentially long details
    private String detail; // 告警详情

    @Column(nullable = false)
    private LocalDateTime alertTime; // 告警发生时间 (前端字段叫 time)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertStatus status; // 告警状态

    // For relatedData, a simple approach is a JSONB or TEXT column
    // Or create a separate entity if it's complex and needs querying
    // Using TEXT for simplicity here, store JSON string
    @Column(columnDefinition = "TEXT") 
    private String relatedData; // 关联数据 (JSON 字符串)
    
    @Column(length = 500) // Optional field for resolution comments
    private String comment; // 处理意见/备注

    @CreatedDate // Use @CreatedDate for creation timestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt; // 记录创建时间

    // Add last modified time if needed for tracking updates
    // @LastModifiedDate
    // @Column(nullable = false)
    // private LocalDateTime updatedAt;

    // Constructors, Getters/Setters managed by Lombok @Data
} 