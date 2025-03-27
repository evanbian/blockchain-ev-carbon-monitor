# 智能合约开发

本目录包含基于区块链的新能源车辆碳减排计量系统的智能合约代码。

## 合约架构

系统由以下几个核心智能合约组成：

1. **AccessControl**：权限控制合约，管理系统中不同角色的权限
2. **VehicleRegistry**：车辆注册合约，存储车辆基本信息
3. **CarbonCalculator**：碳减排计算合约，根据车辆行驶数据计算碳减排量
4. **CreditsGenerator**：碳积分生成合约，根据碳减排量生成碳积分
5. **CreditsManager**：积分管理合约，处理积分的发放、转移和使用
6. **ContractManager**：合约管理器，管理所有合约的升级和互操作

## 开发环境

- Truffle v5.8.2
- Solidity v0.8.17
- Node.js v18+

## 安装依赖

```bash
npm install
```

## 编译合约

```bash
npx truffle compile
```

## 部署合约

### 本地开发环境

1. 确保本地以太坊节点（如Ganache）正在运行，默认端口为8545
2. 执行迁移脚本

```bash
npx truffle migrate --network development
```

### 测试网络

1. 配置 `.env` 文件，参考 `.env.example`
2. 执行迁移脚本，指定网络

```bash
npx truffle migrate --network ropsten
```

## 运行测试

```bash
npx truffle test
```

## 系统角色

系统中定义了以下角色：

- **ADMIN_ROLE**：管理员，可以授予/撤销角色，设置系统参数
- **VEHICLE_MANAGER_ROLE**：车辆管理员，可以注册车辆，更新车辆状态
- **CALCULATOR_ROLE**：计算员，可以计算碳减排量
- **CREDITS_MANAGER_ROLE**：积分管理员，可以生成和管理碳积分

## 合约接口

### AccessControl

- `hasRole(bytes32 role, address account)`: 检查账户是否拥有角色
- `grantRole(bytes32 role, address account)`: 授予角色
- `revokeRole(bytes32 role, address account)`: 撤销角色

### VehicleRegistry

- `registerVehicle(string vin, string model, uint256 batteryCapacity)`: 注册车辆
- `updateVehicleStatus(string vin, bool isActive)`: 更新车辆状态
- `getVehicleCount()`: 获取车辆数量
- `isVehicleRegistered(string vin)`: 检查车辆是否已注册

### CarbonCalculator

- `setEmissionFactors(uint256 _gridFactor, uint256 _vehicleFactor)`: 设置排放因子
- `calculateCarbonReduction(string vin, uint256 date, uint256 mileage, uint256 energyConsumption)`: 计算碳减排量
- `verifyCalculation(bytes32 calculationId)`: 验证计算结果
- `getCalculation(bytes32 calculationId)`: 获取计算结果

### CreditsGenerator

- `setConversionRate(uint256 _rate)`: 设置转换系数
- `generateCredits(bytes32 calculationId)`: 生成积分
- `markAsIssued(bytes32 creditId)`: 标记积分已发放
- `getCreditRecord(bytes32 creditId)`: 获取积分记录

### CreditsManager

- `issueCredits(bytes32 creditId)`: 发放积分
- `transferFromVehicle(string vin, address to, uint256 amount)`: 从车辆转移积分到账户
- `transfer(address to, uint256 amount)`: 账户之间转移积分
- `useCredits(uint256 amount, string purpose)`: 使用积分
- `getVehicleBalance(string vin)`: 获取车辆积分余额
- `getAccountBalance(address account)`: 获取账户积分余额

### ContractManager

- `registerContract(bytes32 contractName, address contractAddress, uint256 version)`: 注册合约
- `upgradeContract(bytes32 contractName, address newContractAddress, uint256 newVersion)`: 升级合约
- `getContractAddress(bytes32 contractName)`: 获取合约地址
- `getContractVersion(bytes32 contractName)`: 获取合约版本

## 系统流程

1. 车辆注册：通过 `VehicleRegistry.registerVehicle()` 注册车辆
2. 数据上报：系统记录车辆行驶数据
3. 碳减排计算：通过 `CarbonCalculator.calculateCarbonReduction()` 计算碳减排量
4. 计算结果验证：管理员通过 `CarbonCalculator.verifyCalculation()` 验证计算结果
5. 积分生成：通过 `CreditsGenerator.generateCredits()` 生成积分
6. 积分发放：通过 `CreditsManager.issueCredits()` 发放积分到车辆账户
7. 积分转移：通过 `CreditsManager.transferFromVehicle()` 将积分从车辆转移到用户账户
8. 积分使用：用户通过 `CreditsManager.useCredits()` 使用积分

## 注意事项

- 所有关键操作都需要相应的角色权限
- 确保在生产环境中妥善保管管理员私钥
- 合约升级时需要谨慎，确保新合约兼容旧数据
