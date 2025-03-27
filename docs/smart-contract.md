# 智能合约设计文档

## 1. 概述

本文档描述了基于区块链的新能源车辆碳减排计量系统中的智能合约设计。系统将使用以太坊私有链和PoA共识机制，智能合约用于实现碳减排计算、碳积分生成和积分管理等核心功能。

## 2. 合约架构

### 2.1 整体架构

系统智能合约架构如下：

```
┌────────────────────┐      ┌────────────────────┐
│                    │      │                    │
│    合约管理器       │◄────►│     权限控制       │
│   ContractManager  │      │  AccessControl    │
│                    │      │                    │
└────────────────────┘      └────────────────────┘
         ▲                           ▲
         │                           │
         ▼                           ▼
┌────────────────────┐      ┌────────────────────┐
│                    │      │                    │
│   碳减排计算合约    │◄────►│   碳积分生成合约    │
│ CarbonCalculator   │      │  CreditsGenerator  │
│                    │      │                    │
└────────────────────┘      └────────────────────┘
         ▲                           ▲
         │                           │
         ▼                           ▼
┌────────────────────┐      ┌────────────────────┐
│                    │      │                    │
│    车辆数据仓库     │◄────►│    积分管理合约     │
│  VehicleRegistry   │      │  CreditsManager    │
│                    │      │                    │
└────────────────────┘      └────────────────────┘
```

### 2.2 合约关系

- **ContractManager**: 管理所有合约的升级和互操作
- **AccessControl**: 提供权限控制功能，确保只有授权账户可以执行关键操作
- **VehicleRegistry**: 存储车辆基本信息和行驶数据的哈希
- **CarbonCalculator**: 实现碳减排计算逻辑
- **CreditsGenerator**: 根据碳减排量生成碳积分
- **CreditsManager**: 管理碳积分的转移、使用和查询

## 3. 合约详细设计

### 3.1 AccessControl (权限控制合约)

#### 3.1.1 功能描述

提供基于角色的权限控制系统，确保只有授权账户可以调用关键功能。

#### 3.1.2 状态变量

```solidity
// 角色定义
bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
bytes32 public constant CALCULATOR_ROLE = keccak256("CALCULATOR_ROLE");
bytes32 public constant VEHICLE_MANAGER_ROLE = keccak256("VEHICLE_MANAGER_ROLE");
bytes32 public constant CREDITS_MANAGER_ROLE = keccak256("CREDITS_MANAGER_ROLE");

// 角色映射
mapping(bytes32 => mapping(address => bool)) private _roles;
```

#### 3.1.3 主要方法

```solidity
// 检查账户是否拥有特定角色
function hasRole(bytes32 role, address account) public view returns (bool);

// 授予角色
function grantRole(bytes32 role, address account) public onlyRole(ADMIN_ROLE);

// 撤销角色
function revokeRole(bytes32 role, address account) public onlyRole(ADMIN_ROLE);

// 角色检查修饰器
modifier onlyRole(bytes32 role);
```

### 3.2 VehicleRegistry (车辆数据仓库合约)

#### 3.2.1 功能描述

存储车辆信息和行驶数据的哈希，验证数据真实性。

#### 3.2.2 数据结构

```solidity
// 车辆信息结构
struct Vehicle {
    string vin;               // 车辆识别码
    string model;             // 车型
    uint256 batteryCapacity;  // 电池容量(Wh)
    uint256 registerTime;     // 注册时间戳
    bool isActive;            // 是否激活
}

// 行驶数据结构
struct DrivingRecord {
    string vin;               // 车辆识别码
    uint256 timestamp;        // 时间戳
    uint256 mileage;          // 行驶里程(m)
    uint256 energyConsumption;// 能耗(Wh)
    bytes32 dataHash;         // 原始数据哈希
}
```

#### 3.2.3 状态变量

```solidity
// 所有注册车辆
mapping(string => Vehicle) public vehicles;

// 车辆VIN码列表
string[] public vehicleVINs;

// 车辆行驶数据哈希映射
mapping(string => mapping(uint256 => bytes32)) public drivingDataHashes;

// 车辆数据上报时间映射
mapping(string => uint256[]) public vehicleDataTimestamps;
```

#### 3.2.4 主要方法

```solidity
// 注册新车辆
function registerVehicle(
    string memory vin,
    string memory model,
    uint256 batteryCapacity
) public onlyRole(VEHICLE_MANAGER_ROLE);

// 更新车辆状态
function updateVehicleStatus(string memory vin, bool isActive) 
    public onlyRole(VEHICLE_MANAGER_ROLE);

// 提交行驶数据哈希
function submitDrivingData(
    string memory vin,
    uint256 timestamp,
    uint256 mileage,
    uint256 energyConsumption,
    bytes32 dataHash
) public onlyRole(VEHICLE_MANAGER_ROLE);

// 验证数据哈希
function verifyDrivingData(
    string memory vin,
    uint256 timestamp,
    uint256 mileage,
    uint256 energyConsumption,
    bytes calldata originalData
) public view returns (bool);

// 获取车辆列表
function getVehicleCount() public view returns (uint256);

// 检查车辆是否已注册
function isVehicleRegistered(string memory vin) public view returns (bool);
```

### 3.3 CarbonCalculator (碳减排计算合约)

#### 3.3.1 功能描述

根据国标方法学计算车辆碳减排量。

#### 3.3.2 数据结构

```solidity
// 减排计算结果结构
struct CarbonReduction {
    string vin;               // 车辆识别码
    uint256 date;             // 计算日期(时间戳)
    uint256 mileage;          // 行驶里程(m)
    uint256 energyConsumption;// 能耗(Wh)
    uint256 carbonReduction;  // 碳减排量(g)
    bytes32 calculationId;    // 计算ID
    bool isVerified;          // 是否已验证
}
```

#### 3.3.3 状态变量

```solidity
// 电网碳排放因子(g CO2/kWh)
uint256 public gridEmissionFactor;

// 传统燃油车排放因子(g CO2/km)
uint256 public traditionalVehicleEmissionFactor;

// 计算记录映射
mapping(bytes32 => CarbonReduction) public calculations;

// 车辆计算记录映射
mapping(string => bytes32[]) public vehicleCalculations;
```

#### 3.3.4 主要方法

```solidity
// 设置排放因子
function setEmissionFactors(
    uint256 _gridFactor,
    uint256 _vehicleFactor
) public onlyRole(ADMIN_ROLE);

// 计算碳减排量
function calculateCarbonReduction(
    string memory vin,
    uint256 date,
    uint256 startTime,
    uint256 endTime
) public onlyRole(CALCULATOR_ROLE) returns (bytes32);

// 验证计算结果
function verifyCalculation(bytes32 calculationId) public onlyRole(ADMIN_ROLE);

// 获取计算结果
function getCalculation(bytes32 calculationId) 
    public view returns (CarbonReduction memory);

// 获取车辆计算记录数量
function getVehicleCalculationCount(string memory vin) 
    public view returns (uint256);
```

### 3.4 CreditsGenerator (碳积分生成合约)

#### 3.4.1 功能描述

根据碳减排量生成碳积分。

#### 3.4.2 数据结构

```solidity
// 积分记录结构
struct CreditRecord {
    bytes32 calculationId;    // 关联的计算ID
    string vin;               // 车辆识别码
    uint256 amount;           // 积分数量(wei)
    uint256 timestamp;        // 生成时间戳
    bool isIssued;            // 是否已发放
}
```

#### 3.4.3 状态变量

```solidity
// 转换系数(g CO2 -> 积分)
uint256 public conversionRate;

// 积分记录映射
mapping(bytes32 => CreditRecord) public creditRecords;

// 车辆积分记录映射
mapping(string => bytes32[]) public vehicleCreditRecords;
```

#### 3.4.4 主要方法

```solidity
// 设置转换系数
function setConversionRate(uint256 _rate) public onlyRole(ADMIN_ROLE);

// 生成积分
function generateCredits(bytes32 calculationId) 
    public onlyRole(CREDITS_MANAGER_ROLE) returns (bytes32);

// 获取车辆积分记录数量
function getVehicleCreditRecordCount(string memory vin) 
    public view returns (uint256);

// 获取积分记录
function getCreditRecord(bytes32 creditId) 
    public view returns (CreditRecord memory);
```

### 3.5 CreditsManager (积分管理合约)

#### 3.5.1 功能描述

管理碳积分的发放、转移和使用。

#### 3.5.2 状态变量

```solidity
// 车辆积分余额
mapping(string => uint256) public vehicleCreditsBalance;

// 账户积分余额
mapping(address => uint256) public accountCreditsBalance;

// 总积分发行量
uint256 public totalCreditsIssued;

// 总积分使用量
uint256 public totalCreditsUsed;
```

#### 3.5.3 主要方法

```solidity
// 发放积分
function issueCredits(bytes32 creditId) 
    public onlyRole(CREDITS_MANAGER_ROLE);

// 从车辆转移积分到账户
function transferFromVehicle(
    string memory vin,
    address to,
    uint256 amount
) public onlyRole(CREDITS_MANAGER_ROLE);

// 从账户转移积分
function transfer(address to, uint256 amount) public;

// 使用积分
function useCredits(uint256 amount, string memory purpose) public;

// 获取车辆积分余额
function getVehicleBalance(string memory vin) public view returns (uint256);

// 获取账户积分余额
function getAccountBalance(address account) public view returns (uint256);
```

### 3.6 ContractManager (合约管理器)

#### 3.6.1 功能描述

管理所有合约的升级和互操作。

#### 3.6.2 状态变量

```solidity
// 合约地址映射
mapping(bytes32 => address) public contractAddresses;

// 合约版本映射
mapping(bytes32 => uint256) public contractVersions;
```

#### 3.6.3 主要方法

```solidity
// 注册合约
function registerContract(
    bytes32 contractName,
    address contractAddress,
    uint256 version
) public onlyRole(ADMIN_ROLE);

// 升级合约
function upgradeContract(
    bytes32 contractName,
    address newContractAddress,
    uint256 newVersion
) public onlyRole(ADMIN_ROLE);

// 获取合约地址
function getContractAddress(bytes32 contractName) 
    public view returns (address);

// 获取合约版本
function getContractVersion(bytes32 contractName) 
    public view returns (uint256);
```

## 4. 合约交互流程

### 4.1 车辆注册流程

1. 管理员调用`VehicleRegistry.registerVehicle()`注册新车辆
2. 系统记录车辆信息并激活

### 4.2 数据上报流程

1. 车载终端收集行驶数据并计算哈希
2. 管理员调用`VehicleRegistry.submitDrivingData()`提交数据哈希
3. 系统记录数据哈希和时间戳

### 4.3 碳减排计算流程

1. 计算员调用`CarbonCalculator.calculateCarbonReduction()`
2. 系统从`VehicleRegistry`获取车辆行驶数据
3. 根据国标方法学计算碳减排量
4. 生成计算ID并记录计算结果

### 4.4 碳积分生成流程

1. 积分管理员调用`CreditsGenerator.generateCredits()`
2. 系统从`CarbonCalculator`获取碳减排计算结果
3. 根据转换系数计算碳积分数量
4. 生成积分ID并记录积分信息

### 4.5 积分发放流程

1. 积分管理员调用`CreditsManager.issueCredits()`
2. 系统从`CreditsGenerator`获取积分记录
3. 增加车辆积分余额并更新总发行量

## 5. 安全考虑

### 5.1 权限控制

- 使用基于角色的访问控制
- 关键操作需要多重签名
- 权限分离，防止单点控制

### 5.2 数据验证

- 输入参数严格验证
- 数据哈希验证确保数据完整性
- 状态变更检查和限制

### 5.3 防重放攻击

- 使用nonce防止交易重放
- 时间戳检查防止过期数据

### 5.4 合约升级

- 使用代理模式实现合约升级
- 保留状态数据，确保业务连续性
- 升级操作需要多方确认

## 6. Gas优化

### 6.1 存储优化

- 使用适当的数据类型减少存储空间
- 合理组织存储布局，减少槽位使用
- 使用映射代替数组，降低Gas消耗

### 6.2 计算优化

- 复杂计算在链下进行，链上仅验证
- 使用位运算代替高成本运算
- 批量处理减少交易次数

### 6.3 事件使用

- 使用事件记录非关键数据
- 减少存储使用，降低Gas成本
- 方便链外应用追踪状态变更

## 7. 测试策略

### 7.1 单元测试

- 测试每个合约的独立功能
- 边界条件测试
- 异常处理测试

### 7.2 集成测试

- 测试合约间的交互
- 模拟完整业务流程
- 多账户并发测试

### 7.3 安全测试

- 模拟各类攻击场景
- 权限越界测试
- 溢出和重入攻击测试

## 8. 部署流程

### 8.1 部署顺序

1. 部署AccessControl合约
2. 部署ContractManager合约
3. 部署VehicleRegistry合约
4. 部署CarbonCalculator合约
5. 部署CreditsGenerator合约
6. 部署CreditsManager合约
7. 在ContractManager中注册所有合约
8. 设置各合约之间的关联关系

### 8.2 初始化

- 设置初始管理员账户
- 配置排放因子和转换系数
- 授予必要角色给操作账户

## 9. 监控与维护

### 9.1 事件监听

- 监听关键事件，如车辆注册、计算完成
- 记录异常事件，如权限拒绝、验证失败
- 统计事件，如积分总量、车辆数量

### 9.2 状态检查

- 定期检查合约状态
- 监控关键参数变化
- 自动化健康检查

### 9.3 版本管理

- 记录合约版本历史
- 文档化变更内容
- 审计升级过程
