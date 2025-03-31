好的，我将按照文档格式输出共享接口定义文档：

# 共享接口定义文档

本文档定义了前端、后端和区块链模块之间共享的接口，确保各模块开发保持一致性。

## API接口定义

### 通用响应格式

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

### 1. 车辆管理接口

#### 1.1 获取车辆列表

- **URL**: `/api/v1/vehicles`
- **Method**: `GET`
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

#### 1.2 获取车辆详情

- **URL**: `/api/v1/vehicles/:vin`
- **Method**: `GET`
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

#### 1.3 添加车辆

- **URL**: `/api/v1/vehicles`
- **Method**: `POST`
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
    "maxRange": 605,
    "registerDate": "2022-06-15"
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

#### 1.4 更新车辆信息

- **URL**: `/api/v1/vehicles/:vin`
- **Method**: `PUT`
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

#### 1.5 删除车辆

- **URL**: `/api/v1/vehicles/:vin`
- **Method**: `DELETE`
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

### 2. 数据分析接口

#### 2.1 获取碳减排总量

- **URL**: `/api/v1/analytics/carbon-reduction/summary`
- **Method**: `GET`
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

#### 2.2 获取碳减排趋势

- **URL**: `/api/v1/analytics/carbon-reduction/trends`
- **Method**: `GET`
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

#### 2.3 获取车型碳减排对比

- **URL**: `/api/v1/analytics/carbon-reduction/by-model`
- **Method**: `GET`
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

#### 2.4 获取车辆行驶数据

- **URL**: `/api/v1/analytics/driving-data`
- **Method**: `GET`
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

#### 2.5 获取预测数据

- **URL**: `/api/v1/analytics/predictions`
- **Method**: `GET`
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

### 3. 区块链接口

#### 3.1 获取区块信息

- **URL**: `/api/v1/blockchain/blocks`
- **Method**: `GET`
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

#### 3.2 获取区块详情

- **URL**: `/api/v1/blockchain/blocks/:blockNumber`
- **Method**: `GET`
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

#### 3.3 获取交易信息

- **URL**: `/api/v1/blockchain/transactions/:txHash`
- **Method**: `GET`
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

## 智能合约接口定义

### 1. VehicleRegistry 合约

#### 1.1 注册车辆
```solidity
function registerVehicle(string memory vin, string memory model, uint256 batteryCapacity) public onlyRole(VEHICLE_MANAGER_ROLE);
```

#### 1.2 更新车辆状态
```solidity
function updateVehicleStatus(string memory vin, bool isActive) public onlyRole(VEHICLE_MANAGER_ROLE);
```

#### 1.3 获取车辆数量
```solidity
function getVehicleCount() public view returns (uint256);
```

#### 1.4 检查车辆是否已注册
```solidity
function isVehicleRegistered(string memory vin) public view returns (bool);
```

### 2. CarbonCalculator 合约

#### 2.1 设置排放因子
```solidity
function setEmissionFactors(uint256 _gridFactor, uint256 _vehicleFactor) public onlyRole(ADMIN_ROLE);
```

#### 2.2 计算碳减排量
```solidity
function calculateCarbonReduction(string memory vin, uint256 date, uint256 mileage, uint256 energyConsumption) public onlyRole(CALCULATOR_ROLE) returns (bytes32);
```

#### 2.3 验证计算结果
```solidity
function verifyCalculation(bytes32 calculationId) public onlyRole(ADMIN_ROLE);
```

#### 2.4 获取计算结果
```solidity
function getCalculation(bytes32 calculationId) public view returns (CarbonReduction memory);
```

### 3. CreditsGenerator 合约

#### 3.1 设置转换系数
```solidity
function setConversionRate(uint256 _rate) public onlyRole(ADMIN_ROLE);
```

#### 3.2 生成积分
```solidity
function generateCredits(bytes32 calculationId) public onlyRole(CREDITS_MANAGER_ROLE) returns (bytes32);
```

#### 3.3 获取积分记录
```solidity
function getCreditRecord(bytes32 creditId) public view returns (CreditRecord memory);
```

### 4. CreditsManager 合约

#### 4.1 发放积分
```solidity
function issueCredits(bytes32 creditId) public onlyRole(CREDITS_MANAGER_ROLE);
```

#### 4.2 从车辆转移积分到账户
```solidity
function transferFromVehicle(string memory vin, address to, uint256 amount) public onlyRole(CREDITS_MANAGER_ROLE);
```

#### 4.3 转移积分
```solidity
function transfer(address to, uint256 amount) public;
```

#### 4.4 使用积分
```solidity
function useCredits(uint256 amount, string memory purpose) public returns (bytes32);
```

## 数据模型定义

### 1. 车辆信息模型

```json
{
  "vin": "字符串(车辆识别码)",
  "model": "字符串(车型)",
  "licensePlate": "字符串(车牌号)",
  "manufacturer": "字符串(制造商)",
  "productionYear": "整数(生产年份)",
  "batteryCapacity": "浮点数(电池容量kWh)",
  "maxRange": "整数(最大续航里程km)",
  "registerDate": "日期(注册日期)",
  "status": "字符串(状态:online/offline/error)",
  "lastUpdateTime": "日期时间(最后更新时间)",
  "totalMileage": "浮点数(总里程km)",
  "totalEnergy": "浮点数(总能耗kWh)",
  "totalCarbonReduction": "浮点数(总碳减排量kg)",
  "carbonCredits": "浮点数(碳积分)"
}
```

### 2. 碳减排数据模型

```json
{
  "vin": "字符串(车辆识别码)",
  "date": "日期(计算日期)",
  "mileage": "浮点数(行驶里程km)",
  "energyConsumption": "浮点数(能耗kWh)",
  "carbonReduction": "浮点数(碳减排量kg)",
  "equivalentFuelConsumption": "浮点数(等效燃油消耗L)",
  "carbonCredits": "浮点数(碳积分)",
  "calculationMethod": "字符串(计算方法)",
  "verificationStatus": "字符串(验证状态)",
  "blockchainTxHash": "字符串(区块链交易哈希)"
}
```

### 3. 区块信息模型

```json
{
  "number": "整数(区块号)",
  "hash": "字符串(区块哈希)",
  "parentHash": "字符串(父区块哈希)",
  "timestamp": "整数(时间戳)",
  "transactions": "数组(交易哈希列表)",
  "miner": "字符串(矿工地址)",
  "difficulty": "字符串(难度)",
  "totalDifficulty": "字符串(总难度)",
  "size": "整数(大小)",
  "gasUsed": "整数(Gas使用量)",
  "gasLimit": "整数(Gas限制)",
  "extraData": "字符串(额外数据)"
}
```

## 接口变更记录

| 日期 | 接口 | 变更内容 | 发起方 | 状态 |
|------|------|---------|-------|------|
| 2023-07-01 | 初始版本 | 创建文档 | - | 已确认 |
