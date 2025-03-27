# 数据库设计文档

## 1. 概述

本文档描述了基于区块链的新能源车辆碳减排计量系统的数据库设计。系统采用关系型数据库(PostgreSQL)和区块链存储相结合的方式，实现数据的高效访问和不可篡改性。

## 2. 数据库选型

### 2.1 关系型数据库

- **选型**: PostgreSQL 14+
- **理由**:
  - 强大的查询能力和事务支持
  - 优秀的地理空间数据支持(PostGIS)
  - 时序数据处理能力强
  - 开源免费，社区活跃

### 2.2 缓存数据库

- **选型**: Redis 6+
- **理由**:
  - 高性能缓存
  - 支持多种数据结构
  - 适合实时数据处理
  - 减轻主数据库负载

### 2.3 区块链存储

- **选型**: 以太坊私有链
- **理由**:
  - 数据不可篡改性
  - 智能合约支持
  - 适合关键数据和交易存储

## 3. 数据库架构

### 3.1 关系型数据库模式

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│    vehicles    │     │ driving_records │     │ carbon_records │
└────────────────┘     └────────────────┘     └────────────────┘
        │                      │                      │
        └──────────┬──────────┘                      │
                   │                                 │
                   ▼                                 ▼
            ┌────────────────┐              ┌────────────────┐
            │   alerts       │              │ carbon_credits │
            └────────────────┘              └────────────────┘
                   │                                 │
                   │                                 │
                   ▼                                 ▼
            ┌────────────────┐              ┌────────────────┐
            │   users        │              │ blockchain_tx  │
            └────────────────┘              └────────────────┘
```

### 3.2 Redis缓存结构

- **实时数据**: Hash结构存储车辆最新状态
- **排行榜**: Sorted Set存储减排排名
- **统计计数**: String存储累计值
- **消息队列**: List结构存储告警消息

## 4. 数据表设计

### 4.1 vehicles (车辆信息表)

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| vin | VARCHAR(17) | 车辆识别码 | PRIMARY KEY |
| model | VARCHAR(100) | 车型 | NOT NULL |
| license_plate | VARCHAR(20) | 车牌号 | UNIQUE |
| manufacturer | VARCHAR(100) | 制造商 | NOT NULL |
| production_year | INTEGER | 生产年份 | NOT NULL |
| battery_capacity | NUMERIC(10,2) | 电池容量(kWh) | NOT NULL |
| max_range | INTEGER | 最大续航里程(km) | NOT NULL |
| register_date | DATE | 注册日期 | NOT NULL |
| status | VARCHAR(20) | 状态(online/offline/error) | NOT NULL |
| last_update_time | TIMESTAMP | 最后更新时间 | NOT NULL |
| created_at | TIMESTAMP | 创建时间 | NOT NULL DEFAULT NOW() |
| updated_at | TIMESTAMP | 更新时间 | NOT NULL DEFAULT NOW() |

### 4.2 driving_records (行驶记录表)

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | BIGSERIAL | 记录ID | PRIMARY KEY |
| vin | VARCHAR(17) | 车辆识别码 | FOREIGN KEY REFERENCES vehicles(vin) |
| record_time | TIMESTAMP | 记录时间 | NOT NULL |
| mileage | NUMERIC(10,2) | 行驶里程(km) | NOT NULL |
| speed | NUMERIC(10,2) | 当前速度(km/h) | NOT NULL |
| battery_level | INTEGER | 电池电量百分比 | NOT NULL |
| energy_consumption | NUMERIC(10,2) | 能耗(kWh) | NOT NULL |
| latitude | NUMERIC(10,6) | 纬度 | NOT NULL |
| longitude | NUMERIC(10,6) | 经度 | NOT NULL |
| status_code | VARCHAR(20) | 状态码 | NOT NULL |
| created_at | TIMESTAMP | 创建时间 | NOT NULL DEFAULT NOW() |

**索引**:
- (vin, record_time) 复合索引
- (latitude, longitude) 地理空间索引

### 4.3 carbon_records (碳减排记录表)

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | BIGSERIAL | 记录ID | PRIMARY KEY |
| vin | VARCHAR(17) | 车辆识别码 | FOREIGN KEY REFERENCES vehicles(vin) |
| calculation_date | DATE | 计算日期 | NOT NULL |
| mileage | NUMERIC(10,2) | 行驶里程(km) | NOT NULL |
| energy_consumption | NUMERIC(10,2) | 能耗(kWh) | NOT NULL |
| carbon_reduction | NUMERIC(10,2) | 碳减排量(kg) | NOT NULL |
| equivalent_fuel | NUMERIC(10,2) | 等效燃油(L) | NOT NULL |
| calculation_method | VARCHAR(50) | 计算方法 | NOT NULL |
| verification_status | VARCHAR(20) | 验证状态 | NOT NULL |
| blockchain_tx_hash | VARCHAR(66) | 区块链交易哈希 | UNIQUE |
| created_at | TIMESTAMP | 创建时间 | NOT NULL DEFAULT NOW() |
| updated_at | TIMESTAMP | 更新时间 | NOT NULL DEFAULT NOW() |

**索引**:
- (vin, calculation_date) 复合索引
- blockchain_tx_hash 索引

### 4.4 carbon_credits (碳积分表)

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | BIGSERIAL | 记录ID | PRIMARY KEY |
| carbon_record_id | BIGINT | 碳减排记录ID | FOREIGN KEY REFERENCES carbon_records(id) |
| vin | VARCHAR(17) | 车辆识别码 | FOREIGN KEY REFERENCES vehicles(vin) |
| credit_amount | NUMERIC(10,2) | 积分数量 | NOT NULL |
| credit_date | DATE | 积分生成日期 | NOT NULL |
| blockchain_tx_hash | VARCHAR(66) | 区块链交易哈希 | UNIQUE |
| status | VARCHAR(20) | 状态(active/used/expired) | NOT NULL |
| created_at | TIMESTAMP | 创建时间 | NOT NULL DEFAULT NOW() |
| updated_at | TIMESTAMP | 更新时间 | NOT NULL DEFAULT NOW() |

**索引**:
- (vin, credit_date) 复合索引
- blockchain_tx_hash 索引

### 4.5 alerts (告警信息表)

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | BIGSERIAL | 告警ID | PRIMARY KEY |
| vin | VARCHAR(17) | 车辆识别码 | FOREIGN KEY REFERENCES vehicles(vin) |
| alert_type | VARCHAR(50) | 告警类型 | NOT NULL |
| alert_level | VARCHAR(20) | 告警级别(low/medium/high) | NOT NULL |
| alert_message | TEXT | 告警信息 | NOT NULL |
| alert_time | TIMESTAMP | 告警时间 | NOT NULL |
| status | VARCHAR(20) | 状态(new/acknowledged/resolved) | NOT NULL |
| resolved_time | TIMESTAMP | 解决时间 | NULL |
| created_at | TIMESTAMP | 创建时间 | NOT NULL DEFAULT NOW() |
| updated_at | TIMESTAMP | 更新时间 | NOT NULL DEFAULT NOW() |

**索引**:
- (vin, alert_time) 复合索引
- status 索引

### 4.6 users (用户表)

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | BIGSERIAL | 用户ID | PRIMARY KEY |
| username | VARCHAR(100) | 用户名 | UNIQUE NOT NULL |
| password_hash | VARCHAR(255) | 密码哈希 | NOT NULL |
| role | VARCHAR(20) | 角色(admin/operator/viewer) | NOT NULL |
| email | VARCHAR(100) | 电子邮件 | UNIQUE |
| last_login | TIMESTAMP | 最后登录时间 | NULL |
| status | VARCHAR(20) | 状态(active/inactive) | NOT NULL |
| created_at | TIMESTAMP | 创建时间 | NOT NULL DEFAULT NOW() |
| updated_at | TIMESTAMP | 更新时间 | NOT NULL DEFAULT NOW() |

### 4.7 blockchain_tx (区块链交易记录表)

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| tx_hash | VARCHAR(66) | 交易哈希 | PRIMARY KEY |
| block_number | BIGINT | 区块号 | NOT NULL |
| block_hash | VARCHAR(66) | 区块哈希 | NOT NULL |
| from_address | VARCHAR(42) | 发送地址 | NOT NULL |
| to_address | VARCHAR(42) | 接收地址 | NOT NULL |
| data_type | VARCHAR(50) | 数据类型(carbon_record/credit/other) | NOT NULL |
| status | VARCHAR(20) | 状态(pending/confirmed/failed) | NOT NULL |
| gas_used | BIGINT | 消耗的Gas | NOT NULL |
| timestamp | TIMESTAMP | 交易时间戳 | NOT NULL |
| created_at | TIMESTAMP | 创建时间 | NOT NULL DEFAULT NOW() |
| updated_at | TIMESTAMP | 更新时间 | NOT NULL DEFAULT NOW() |

**索引**:
- block_number 索引
- (data_type, timestamp) 复合索引

## 5. 数据关系

### 5.1 主要关系

- 一辆车(vehicles)有多条行驶记录(driving_records)
- 一辆车(vehicles)有多条碳减排记录(carbon_records)
- 一条碳减排记录(carbon_records)可生成一条碳积分记录(carbon_credits)
- 一辆车(vehicles)可触发多条告警(alerts)

### 5.2 ER图

```
vehicles(1) ──┬── (n)driving_records
              │
              ├── (n)carbon_records ── (1)carbon_credits
              │
              └── (n)alerts
```

## 6. 数据迁移与备份

### 6.1 数据迁移策略

- 使用Flyway工具管理数据库版本
- 增量SQL脚本实现平滑迁移
- 迁移前自动备份以便回滚

### 6.2 备份策略

- 每日全量备份
- 实时事务日志备份
- 异地存储备份数据
- 定期恢复测试

## 7. 性能优化

### 7.1 索引优化

- 为常用查询字段创建索引
- 复合索引优化多字段查询
- 定期分析索引使用情况并调整

### 7.2 分区策略

- 驾驶记录表按时间分区(每月)
- 碳减排记录表按时间分区(每季度)
- 区块链交易记录表按区块号范围分区

### 7.3 查询优化

- 预计算常用统计数据
- 使用物化视图加速复杂查询
- 定期维护数据库统计信息

## 8. 数据安全

### 8.1 访问控制

- 基于角色的数据库访问控制
- 最小权限原则配置数据库用户
- 审计日志记录所有关键操作

### 8.2 数据加密

- 敏感数据列加密存储
- 传输中的数据通过TLS加密
- 备份文件加密

## 9. 区块链数据同步

### 9.1 数据上链策略

- 碳减排记录计算后上链
- 碳积分生成后上链
- 定期数据摘要上链

### 9.2 数据同步机制

- 区块链事件监听机制
- 定时任务检查数据一致性
- 异常处理与自动重试机制
