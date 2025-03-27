# API接口设计文档

## 1. 概述

本文档详细描述了基于区块链的新能源车辆碳减排计量系统的API接口设计。这些接口将用于前端与后端之间的通信，支持系统的三大平台功能：管理平台、分析平台和展示平台。

## 2. API设计原则

### 2.1 RESTful设计

- 使用HTTP动词表示操作（GET、POST、PUT、DELETE）
- 使用名词复数形式作为资源标识
- 使用嵌套资源表示从属关系
- 版本化API路径（/api/v1/...）

### 2.2 响应格式

所有API响应采用统一的JSON格式：

```json
{
  "success": true,  // 操作是否成功
  "code": 200,      // 状态码
  "message": "操作成功", // 提示信息
  "data": {         // 响应数据
    // 具体数据内容
  }
}
```

### 2.3 错误处理

错误响应格式：

```json
{
  "success": false,
  "code": 400,      // HTTP错误码
  "message": "输入参数错误", // 错误描述
  "errors": [       // 详细错误信息（可选）
    {
      "field": "vin",
      "message": "车辆VIN码格式不正确"
    }
  ]
}
```

### 2.4 认证与授权

- 使用JWT(JSON Web Token)进行身份认证
- 基于角色的权限控制
- Token通过Authorization头传递

## 3. API分组

API接口分为以下几个功能组：

1. 认证接口 - `/api/v1/auth`
2. 车辆管理接口 - `/api/v1/vehicles`
3. 数据分析接口 - `/api/v1/analytics`
4. 碳积分接口 - `/api/v1/credits`
5. 区块链接口 - `/api/v1/blockchain`
6. 系统配置接口 - `/api/v1/config`
7. 告警接口 - `/api/v1/alerts`

## 4. 接口详细定义

### 4.1 认证接口

#### 4.1.1 用户登录

- **URL**: `/api/v1/auth/login`
- **方法**: `POST`
- **描述**: 用户登录并获取访问令牌
- **请求参数**:
  ```json
  {
    "username": "admin",
    "password": "password"
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "登录成功",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600,
      "user": {
        "id": 1,
        "username": "admin",
        "role": "administrator"
      }
    }
  }
  ```

#### 4.1.2 刷新令牌

- **URL**: `/api/v1/auth/refresh`
- **方法**: `POST`
- **描述**: 刷新访问令牌
- **请求头**: `Authorization: Bearer <token>`
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "令牌刷新成功",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
    }
  }
  ```

#### 4.1.3 登出

- **URL**: `/api/v1/auth/logout`
- **方法**: `POST`
- **描述**: 用户登出
- **请求头**: `Authorization: Bearer <token>`
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "登出成功",
    "data": null
  }
  ```

### 4.2 车辆管理接口

#### 4.2.1 获取车辆列表

- **URL**: `/api/v1/vehicles`
- **方法**: `GET`
- **描述**: 获取车辆列表，支持分页、排序和筛选
- **请求参数**:
  - `page`: 页码，默认1
  - `size`: 每页记录数，默认20
  - `status`: 车辆状态筛选(all/online/offline/error)
  - `sort`: 排序字段
  - `order`: 排序方向(asc/desc)
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "获取成功",
    "data": {
      "total": 100,
      "page": 1,
      "size": 20,
      "items": [
        {
          "vin": "LSVAU2180N2183294",
          "model": "比亚迪汉EV",
          "licensePlate": "京A12345",
          "manufacturer": "BYD",
          "status": "online",
          "lastUpdateTime": "2023-07-01T12:30:45Z",
          "totalMileage": 12500,
          "totalCarbonReduction": 3750.5,
          "carbonCredits": 187.5
        },
        // 更多车辆...
      ]
    }
  }
  ```

#### 4.2.2 添加车辆

- **URL**: `/api/v1/vehicles`
- **方法**: `POST`
- **描述**: 添加新车辆
- **请求体**:
  ```json
  {
    "vin": "LSVAU2180N2183294",
    "model": "比亚迪汉EV",
    "licensePlate": "京A12345",
    "manufacturer": "BYD",
    "productionYear": 2022,
    "batteryCapacity": 76.9,
    "maxRange": 605
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 201,
    "message": "车辆添加成功",
    "data": {
      "vin": "LSVAU2180N2183294"
    }
  }
  ```

#### 4.2.3 批量导入车辆

- **URL**: `/api/v1/vehicles/batch`
- **方法**: `POST`
- **描述**: 批量导入车辆信息
- **请求体**: 
  - `Content-Type: multipart/form-data`
  - `file`: CSV文件
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "批量导入成功",
    "data": {
      "total": 10,
      "success": 9,
      "failed": 1,
      "failures": [
        {
          "line": 3,
          "vin": "INVALID_VIN",
          "reason": "VIN码格式不正确"
        }
      ]
    }
  }
  ```

#### 4.2.4 获取车辆详情

- **URL**: `/api/v1/vehicles/:vin`
- **方法**: `GET`
- **描述**: 获取指定车辆的详细信息
- **URL参数**:
  - `vin`: 车辆VIN码
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "获取成功",
    "data": {
      "vin": "LSVAU2180N2183294",
      "model": "比亚迪汉EV",
      "licensePlate": "京A12345",
      "manufacturer": "BYD",
      "productionYear": 2022,
      "batteryCapacity": 76.9,
      "maxRange": 605,
      "registerDate": "2022-06-15",
      "status": "online",
      "lastUpdateTime": "2023-07-01T12:30:45Z",
      "totalMileage": 12500,
      "totalEnergy": 2300,
      "totalCarbonReduction": 3750.5,
      "carbonCredits": 187.5
    }
  }
  ```

#### 4.2.5 更新车辆信息

- **URL**: `/api/v1/vehicles/:vin`
- **方法**: `PUT`
- **描述**: 更新车辆信息
- **URL参数**:
  - `vin`: 车辆VIN码
- **请求体**:
  ```json
  {
    "licensePlate": "京B54321",
    "status": "offline"
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "更新成功",
    "data": {
      "vin": "LSVAU2180N2183294"
    }
  }
  ```

#### 4.2.6 删除车辆

- **URL**: `/api/v1/vehicles/:vin`
- **方法**: `DELETE`
- **描述**: 删除指定车辆
- **URL参数**:
  - `vin`: 车辆VIN码
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "删除成功",
    "data": null
  }
  ```

### 4.3 数据分析接口

#### 4.3.1 获取碳减排总量

- **URL**: `/api/v1/analytics/carbon-reduction/summary`
- **方法**: `GET`
- **描述**: 获取碳减排总量统计数据
- **请求参数**:
  - `startDate`: 开始日期(YYYY-MM-DD)
  - `endDate`: 结束日期(YYYY-MM-DD)
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "获取成功",
    "data": {
      "totalReduction": 45682.5,
      "comparedToFuel": 68523.75,
      "economicValue": 91365.0,
      "equivalentTrees": 2284,
      "vehicleCount": 20
    }
  }
  ```

#### 4.3.2 获取碳减排趋势

- **URL**: `/api/v1/analytics/carbon-reduction/trends`
- **方法**: `GET`
- **描述**: 获取碳减排趋势数据
- **请求参数**:
  - `startDate`: 开始日期(YYYY-MM-DD)
  - `endDate`: 结束日期(YYYY-MM-DD)
  - `groupBy`: 分组方式(day/week/month)
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "获取成功",
    "data": {
      "timeline": [
        {
          "date": "2023-06-01",
          "reduction": 1523.5,
          "credits": 76.17
        },
        {
          "date": "2023-06-02",
          "reduction": 1487.2,
          "credits": 74.36
        },
        // 更多数据...
      ]
    }
  }
  ```

#### 4.3.3 获取车型碳减排对比

- **URL**: `/api/v1/analytics/carbon-reduction/by-model`
- **方法**: `GET`
- **描述**: 获取不同车型的碳减排对比数据
- **请求参数**:
  - `startDate`: 开始日期(YYYY-MM-DD)
  - `endDate`: 结束日期(YYYY-MM-DD)
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "获取成功",
    "data": {
      "models": [
        {
          "model": "比亚迪汉EV",
          "reduction": 15682.5,
          "percentage": 34.3,
          "vehicleCount": 7
        },
        {
          "model": "特斯拉Model 3",
          "reduction": 12853.6,
          "percentage": 28.1,
          "vehicleCount": 5
        },
        // 更多车型...
      ]
    }
  }
  ```

#### 4.3.4 获取车辆行驶数据

- **URL**: `/api/v1/analytics/driving-data`
- **方法**: `GET`
- **描述**: 获取车辆行驶数据分析
- **请求参数**:
  - `vin`: 车辆VIN码(可选，不提供则查询所有车辆)
  - `startDate`: 开始日期(YYYY-MM-DD)
  - `endDate`: 结束日期(YYYY-MM-DD)
  - `metrics`: 指标列表(逗号分隔，如mileage,energy,speed)
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "获取成功",
    "data": {
      "summary": {
        "totalMileage": 12500,
        "totalEnergy": 2300,
        "avgSpeed": 45.3
      },
      "timeline": [
        {
          "date": "2023-06-01",
          "mileage": 120.5,
          "energy": 22.8,
          "avgSpeed": 43.2
        },
        // 更多数据...
      ]
    }
  }
  ```

#### 4.3.5 获取预测数据

- **URL**: `/api/v1/analytics/predictions`
- **方法**: `GET`
- **描述**: 获取碳减排预测数据
- **请求参数**:
  - `vin`: 车辆VIN码(可选)
  - `period`: 预测周期(weeks/months)
  - `count`: 预测数量
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "获取成功",
    "data": {
      "predictions": [
        {
          "date": "2023-07-01",
          "predictedReduction": 1620.8,
          "confidence": 0.92
        },
        {
          "date": "2023-08-01",
          "predictedReduction": 1685.3,
          "confidence": 0.85
        },
        // 更多预测...
      ]
    }
  }
  ```

#### 4.3.6 获取热力图数据

- **URL**: `/api/v1/analytics/heatmap`
- **方法**: `GET`
- **描述**: 获取车辆活动热力图数据
- **请求参数**:
  - `date`: 日期(YYYY-MM-DD)
  - `resolution`: 分辨率(high/medium/low)
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "获取成功",
    "data": {
      "points": [
        {
          "lat": 39.908716,
          "lng": 116.397789,
          "weight": 30
        },
        {
          "lat": 39.909607,
          "lng": 116.397789,
          "weight": 25
        },
        // 更多热点...
      ]
    }
  }
  ```

### 4.4 碳积分接口

#### 4.4.1 获取碳积分汇总

- **URL**: `/api/v1/credits/summary`
- **方法**: `GET`
- **描述**: 获取碳积分总量统计数据
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "获取成功",
    "data": {
      "totalCredits": 42568.5,
      "issuedToday": 387.2,
      "issuedThisMonth": 5832.6,
      "activeCredits": 38754.3,
      "usedCredits": 3814.2
    }
  }
  ```

#### 4.4.2 获取车辆碳积分

- **URL**: `/api/v1/credits/vehicles/:vin`
- **方法**: `GET`
- **描述**: 获取指定车辆的碳积分数据
- **URL参数**:
  - `vin`: 车辆VIN码
- **请求参数**:
  - `startDate`: 开始日期(YYYY-MM-DD)
  - `endDate`: 结束日期(YYYY-MM-DD)
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "获取成功",
    "data": {
      "vin": "LSVAU2180N2183294",
      "totalCredits": 187.5,
      "trends": [
        {
          "date": "2023-06-01",
          "credits": 3.2,
          "carbonReduction": 64.0
        },
        // 更多数据...
      ]
    }
  }
  ```

#### 4.4.3 获取积分生成记录

- **URL**: `/api/v1/credits/records`
- **方法**: `GET`
- **描述**: 获取碳积分生成记录
- **请求参数**:
  - `page`: 页码，默认1
  - `size`: 每页记录数，默认20
  - `vin`: 车辆VIN码(可选)
  - `startDate`: 开始日期(YYYY-MM-DD)
  - `endDate`: 结束日期(YYYY-MM-DD)
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "获取成功",
    "data": {
      "total": 156,
      "page": 1,
      "size": 20,
      "items": [
        {
          "id": "CR12345678",
          "vin": "LSVAU2180N2183294",
          "credits": 3.2,
          "carbonReduction": 64.0,
          "date": "2023-06-01",
          "txHash": "0x1234567890abcdef...",
          "status": "confirmed"
        },
        // 更多记录...
      ]
    }
  }
  ```

### 4.5 区块链接口

#### 4.5.1 获取区块信息

- **URL**: `/api/v1/blockchain/blocks`
- **方法**: `GET`
- **描述**: 获取最新区块信息
- **请求参数**:
  - `count`: 返回区块数量，默认10
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "获取成功",
    "data": {
      "blocks": [
        {
          "number": 12345,
          "hash": "0x1234567890abcdef...",
          "timestamp": 1675167642,
          "transactions": 5,
          "miner": "0xabcdef1234567890...",
          "size": 4325
        },
        // 更多区块...
      ]
    }
  }
  ```

#### 4.5.2 获取区块详情

- **URL**: `/api/v1/blockchain/blocks/:blockNumber`
- **方法**: `GET`
- **描述**: 获取指定区块的详细信息
- **URL参数**:
  - `blockNumber`: 区块号
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "获取成功",
    "data": {
      "number": 12345,
      "hash": "0x1234567890abcdef...",
      "parentHash": "0xabcdef1234567890...",
      "timestamp": 1675167642,
      "transactions": [
        "0x1111222233334444...",
        "0x5555666677778888..."
      ],
      "miner": "0xabcdef1234567890...",
      "difficulty": "0",
      "totalDifficulty": "0",
      "size": 4325,
      "gasUsed": 12500000,
      "gasLimit": 30000000,
      "extraData": "0x..."
    }
  }
  ```

#### 4.5.3 获取交易信息

- **URL**: `/api/v1/blockchain/transactions/:txHash`
- **方法**: `GET`
- **描述**: 获取指定交易的详细信息
- **URL参数**:
  - `txHash`: 交易哈希
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "获取成功",
    "data": {
      "hash": "0x1111222233334444...",
      "blockNumber": 12345,
      "from": "0xaaaa11112222...",
      "to": "0xbbbb33334444...",
      "value": "0",
      "gas": 210000,
      "gasPrice": "20000000000",
      "input": "0x...",
      "timestamp": 1675167642,
      "status": "success",
      "decodedInput": {
        "method": "submitDrivingData",
        "params": {
          "vin": "LSVAU2180N2183294",
          "mileage": 12500,
          "energy": 2300
        }
      }
    }
  }
  ```

#### 4.5.4 获取合约信息

- **URL**: `/api/v1/blockchain/contracts/:address`
- **方法**: `GET`
- **描述**: 获取指定合约的信息
- **URL参数**:
  - `address`: 合约地址
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "获取成功",
    "data": {
      "address": "0xbbbb33334444...",
      "name": "CarbonCalculator",
      "version": "1.0.0",
      "abi": [...],
      "deployedAt": 12000,
      "transactionsCount": 2345,
      "lastTransactionAt": 1675167642
    }
  }
  ```

### 4.6 告警接口

#### 4.6.1 获取告警列表

- **URL**: `/api/v1/alerts`
- **方法**: `GET`
- **描述**: 获取告警信息列表
- **请求参数**:
  - `page`: 页码，默认1
  - `size`: 每页记录数，默认20
  - `level`: 告警级别(all/low/medium/high)
  - `status`: 告警状态(all/new/acknowledged/resolved)
  - `vin`: 车辆VIN码(可选)
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "获取成功",
    "data": {
      "total": 42,
      "page": 1,
      "size": 20,
      "items": [
        {
          "id": "ALT12345678",
          "vin": "LSVAU2180N2183294",
          "type": "data_anomaly",
          "level": "medium",
          "message": "能耗数据异常波动",
          "time": "2023-06-01T12:30:45Z",
          "status": "new"
        },
        // 更多告警...
      ]
    }
  }
  ```

#### 4.6.2 获取告警详情

- **URL**: `/api/v1/alerts/:id`
- **方法**: `GET`
- **描述**: 获取指定告警的详细信息
- **URL参数**:
  - `id`: 告警ID
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "获取成功",
    "data": {
      "id": "ALT12345678",
      "vin": "LSVAU2180N2183294",
      "model": "比亚迪汉EV",
      "licensePlate": "京A12345",
      "type": "data_anomaly",
      "level": "medium",
      "message": "能耗数据异常波动",
      "detail": "车辆能耗从正常值突增50%，可能存在数据异常或车辆故障",
      "time": "2023-06-01T12:30:45Z",
      "status": "new",
      "relatedData": {
        "normalEnergyConsumption": 15.6,
        "anomalyEnergyConsumption": 23.4,
        "timestamp": "2023-06-01T12:15:22Z"
      }
    }
  }
  ```

#### 4.6.3 更新告警状态

- **URL**: `/api/v1/alerts/:id/status`
- **方法**: `PUT`
- **描述**: 更新告警状态
- **URL参数**:
  - `id`: 告警ID
- **请求体**:
  ```json
  {
    "status": "acknowledged",
    "comment": "正在调查中"
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "状态更新成功",
    "data": {
      "id": "ALT12345678",
      "status": "acknowledged"
    }
  }
  ```

### 4.7 系统配置接口

#### 4.7.1 获取系统参数

- **URL**: `/api/v1/config/parameters`
- **方法**: `GET`
- **描述**: 获取系统配置参数
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "获取成功",
    "data": {
      "parameters": [
        {
          "key": "grid_emission_factor",
          "name": "电网排放因子",
          "value": "0.8547",
          "unit": "kg CO2/kWh",
          "description": "中国区域电网平均碳排放因子"
        },
        {
          "key": "traditional_vehicle_emission",
          "name": "传统车排放因子",
          "value": "0.196",
          "unit": "kg CO2/km",
          "description": "传统燃油车平均碳排放因子"
        },
        // 更多参数...
      ]
    }
  }
  ```

#### 4.7.2 更新系统参数

- **URL**: `/api/v1/config/parameters/:key`
- **方法**: `PUT`
- **描述**: 更新指定系统参数
- **URL参数**:
  - `key`: 参数键名
- **请求体**:
  ```json
  {
    "value": "0.8323"
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "参数更新成功",
    "data": {
      "key": "grid_emission_factor",
      "value": "0.8323"
    }
  }
  ```

## 5. 状态码定义

| 状态码 | 描述 |
|-------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 422 | 请求无法处理 |
| 500 | 服务器内部错误 |

## 6. 安全与性能

### 6.1 安全措施

- 所有API通过HTTPS传输
- 敏感操作需要JWT认证
- 实现请求频率限制
- 敏感数据传输加密处理

### 6.2 性能优化

- 实现API响应缓存
- 分页处理大量数据
- 异步处理耗时操作
- 支持部分响应(仅返回需要的字段)

## 7. 模拟数据

### 7.1 模拟数据生成

为支持前端开发，将提供以下模拟数据：

- 10-20辆电动车基础信息
- 3个月的模拟行驶数据
- 每日碳减排计算数据
- 区块链交易和区块数据

### 7.2 模拟数据API

- **URL**: `/api/v1/mock/reset`
- **方法**: `POST`
- **描述**: 重置模拟数据
- **响应示例**:
  ```json
  {
    "success": true,
    "code": 200,
    "message": "模拟数据已重置",
    "data": null
  }
  ```

## 8. API版本控制

- 当前版本: v1
- 版本策略: URL路径包含版本号
- 向下兼容: 主版本变更时不保证兼容性
- 废弃通知: API废弃前至少提前30天通知
