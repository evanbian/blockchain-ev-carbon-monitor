package com.example.evcarbonmonitor.domain;

/**
 * 告警类型枚举
 */
public enum AlertType {
    DATA_ANOMALY,     // 数据异常
    ENERGY_ANOMALY,   // 能耗异常
    SYSTEM_ERROR,     // 系统错误
    CONNECTION_LOST,  // 连接丢失
    BATTERY_TEMP_HIGH, // 电池温度过高 (示例)
    LOCATION_DRIFT,   // 位置漂移 (示例)
    LOW_BATTERY      // 低电量 (示例)
    // 可以根据实际需求添加更多类型
} 