# 项目文件夹结构

以下是GitHub项目仓库的完整文件夹结构，用于基于区块链的新能源车辆碳减排计量系统：

```
blockchain-ev-carbon-monitor/
│
├── .github/                          # GitHub相关配置
│   └── workflows/                    # CI/CD工作流配置
│       ├── frontend-ci.yml           # 前端CI配置
│       ├── backend-ci.yml            # 后端CI配置
│       └── smart-contract-ci.yml     # 智能合约CI配置
│
├── docs/                             # 文档目录
│   ├── architecture.md               # 系统架构文档
│   ├── database-design.md            # 数据库设计文档
│   ├── smart-contract.md             # 智能合约设计文档
│   ├── frontend-design.md            # 前端设计文档
│   ├── api-design.md                 # API接口设计文档
│   ├── deployment.md                 # 部署文档
│   ├── user-manual.md                # 用户手册
│   └── images/                       # 文档图片
│       ├── architecture-diagram.png  # 架构图
│       ├── database-schema.png       # 数据库图
│       ├── ui-mockups/               # UI原型图
│       └── ...
│
├── frontend/                         # 前端项目根目录
│   ├── package.json                  # 依赖配置
│   ├── vite.config.ts                # Vite配置
│   ├── tsconfig.json                 # TypeScript配置
│   ├── .eslintrc.js                  # ESLint配置
│   ├── .prettierrc                   # Prettier配置
│   ├── index.html                    # 入口HTML
│   ├── public/                       # 静态资源
│   │   ├── favicon.ico               # 网站图标
│   │   └── ...
│   │
│   ├── src/                          # 源代码
│   │   ├── main.tsx                  # 入口文件
│   │   ├── App.tsx                   # 根组件
│   │   ├── router/                   # 路由配置
│   │   │   └── index.tsx             # 路由定义
│   │   │
│   │   ├── components/               # 公共组件
│   │   │   ├── Layout/               # 布局组件
│   │   │   ├── Charts/               # 图表组件
│   │   │   ├── Blockchain/           # 区块链相关组件
│   │   │   └── UI/                   # UI基础组件
│   │   │
│   │   ├── pages/                    # 页面组件
│   │   │   ├── Admin/                # 管理平台页面
│   │   │   │   ├── Vehicles/         # 车辆管理
│   │   │   │   ├── Settings/         # 系统设置
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── Analysis/             # 分析平台页面
│   │   │   │   ├── Dashboard/        # 仪表盘
│   │   │   │   ├── Carbon/           # 碳减排分析
│   │   │   │   ├── VehicleAnalysis/  # 车辆分析
│   │   │   │   ├── Alerts/           # 告警管理
│   │   │   │   └── ...
│   │   │   │
│   │   │   └── Display/              # 展示平台页面
│   │   │       ├── Overview/         # 总览
│   │   │       ├── Explorer/         # 区块链浏览器
│   │   │       └── ...
│   │   │
│   │   ├── store/                    # 状态管理
│   │   │   ├── index.ts              # Store配置
│   │   │   ├── slices/               # Redux切片
│   │   │   └── hooks.ts              # 自定义Hooks
│   │   │
│   │   ├── services/                 # 服务层
│   │   │   ├── api.ts                # API请求基础配置
│   │   │   ├── vehicles.ts           # 车辆API
│   │   │   ├── analytics.ts          # 分析API
│   │   │   ├── blockchain.ts         # 区块链API
│   │   │   └── ...
│   │   │
│   │   ├── utils/                    # 工具函数
│   │   │   ├── formatters.ts         # 格式化工具
│   │   │   ├── validators.ts         # 验证工具
│   │   │   ├── web3.ts               # Web3工具
│   │   │   └── ...
│   │   │
│   │   ├── hooks/                    # 自定义Hooks
│   │   │   ├── useBlockchain.ts      # 区块链Hook
│   │   │   ├── useCharts.ts          # 图表Hook
│   │   │   └── ...
│   │   │
│   │   ├── assets/                   # 静态资源
│   │   │   ├── styles/               # 样式文件
│   │   │   ├── images/               # 图片资源
│   │   │   └── ...
│   │   │
│   │   └── types/                    # 类型定义
│   │       ├── api.ts                # API类型
│   │       ├── blockchain.ts         # 区块链类型
│   │       └── ...
│   │
│   └── tests/                        # 测试
│       ├── components/               # 组件测试
│       ├── services/                 # 服务测试
│       └── ...
│
├── smart-contracts/                  # 智能合约项目根目录
│   ├── truffle-config.js             # Truffle配置
│   ├── package.json                  # 依赖配置
│   ├── contracts/                    # 合约源码
│   │   ├── access/                   # 权限控制合约
│   │   │   └── AccessControl.sol     # 访问控制合约
│   │   │
│   │   ├── carbon/                   # 碳减排相关合约
│   │   │   ├── CarbonCalculator.sol  # 碳减排计算合约
│   │   │   └── CreditsGenerator.sol  # 积分生成合约
│   │   │
│   │   ├── registry/                 # 注册相关合约
│   │   │   └── VehicleRegistry.sol   # 车辆注册合约
│   │   │
│   │   ├── management/               # 管理相关合约
│   │   │   ├── ContractManager.sol   # 合约管理器
│   │   │   └── CreditsManager.sol    # 积分管理合约
│   │   │
│   │   ├── interfaces/               # 合约接口
│   │   │   ├── ICarbonCalculator.sol # 计算器接口
│   │   │   ├── IVehicleRegistry.sol  # 车辆注册接口
│   │   │   └── ...
│   │   │
│   │   └── libraries/                # 合约库
│   │       ├── SafeMath.sol          # 安全数学库
│   │       └── ...
│   │
│   ├── migrations/                   # 部署脚本
│   │   ├── 1_initial_migration.js    # 初始迁移
│   │   ├── 2_deploy_access_control.js# 部署访问控制
│   │   └── ...
│   │
│   └── test/                         # 合约测试
│       ├── AccessControl.test.js     # 访问控制测试
│       ├── CarbonCalculator.test.js  # 计算器测试
│       └── ...
│
├── backend/                          # 后端项目根目录
│   ├── build.gradle                  # Gradle构建配置
│   ├── settings.gradle               # Gradle设置
│   ├── README.md                     # 后端说明文档
│   │
│   ├── src/                          # 源代码
│   │   ├── main/                     # 主代码
│   │   │   ├── java/                 # Java代码
│   │   │   │   └── com/example/evcarbonmonitor/
│   │   │   │       ├── EvcarbonmonitorApplication.java  # 应用入口
│   │   │   │       │
│   │   │   │       ├── config/       # 配置
│   │   │   │       │   ├── SecurityConfig.java          # 安全配置
│   │   │   │       │   ├── DatabaseConfig.java          # 数据库配置
│   │   │   │       │   └── ...
│   │   │   │       │
│   │   │   │       ├── controller/   # 控制器
│   │   │   │       │   ├── VehicleController.java       # 车辆API
│   │   │   │       │   ├── AnalyticsController.java     # 分析API
│   │   │   │       │   ├── BlockchainController.java    # 区块链API
│   │   │   │       │   └── ...
│   │   │   │       │
│   │   │   │       ├── service/      # 服务层
│   │   │   │       │   ├── VehicleService.java          # 车辆服务
│   │   │   │       │   ├── CarbonCalculationService.java# 计算服务
│   │   │   │       │   ├── BlockchainService.java       # 区块链服务
│   │   │   │       │   └── ...
│   │   │   │       │
│   │   │   │       ├── repository/   # 数据访问层
│   │   │   │       │   ├── VehicleRepository.java       # 车辆仓库
│   │   │   │       │   ├── CarbonRecordRepository.java  # 碳记录仓库
│   │   │   │       │   └── ...
│   │   │   │       │
│   │   │   │       ├── domain/       # 领域模型
│   │   │   │       │   ├── Vehicle.java                 # 车辆模型
│   │   │   │       │   ├── CarbonRecord.java            # 碳记录模型
│   │   │   │       │   ├── Alert.java                   # 告警模型
│   │   │   │       │   └── ...
│   │   │   │       │
│   │   │   │       ├── dto/          # 数据传输对象
│   │   │   │       │   ├── VehicleDTO.java              # 车辆DTO
│   │   │   │       │   ├── AnalyticsDTO.java            # 分析DTO
│   │   │   │       │   └── ...
│   │   │   │       │
│   │   │   │       ├── blockchain/   # 区块链交互
│   │   │   │       │   ├── Web3jService.java            # Web3交互
│   │   │   │       │   ├── ContractService.java         # 合约交互
│   │   │   │       │   └── ...
│   │   │   │       │
│   │   │   │       ├── util/         # 工具类
│   │   │   │       │   ├── DateUtil.java                # 日期工具
│   │   │   │       │   ├── ValidationUtil.java          # 验证工具
│   │   │   │       │   └── ...
│   │   │   │       │
│   │   │   │       └── exception/    # 异常处理
│   │   │   │           ├── GlobalExceptionHandler.java  # 全局异常
│   │   │   │           ├── ApiException.java            # API异常
│   │   │   │           └── ...
│   │   │   │
│   │   │   └── resources/            # 资源文件
│   │   │       ├── application.yml   # 应用配置
│   │   │       ├── application-dev.yml # 开发环境配置
│   │   │       ├── application-prod.yml # 生产环境配置
│   │   │       └── ...
│   │   │
│   │   └── test/                     # 测试代码
│   │       └── java/
│   │           └── com/example/evcarbonmonitor/
│   │               ├── controller/   # 控制器测试
│   │               ├── service/      # 服务测试
│   │               └── ...
│   │
│   └── db/                           # 数据库脚本
│       ├── migrations/               # 迁移脚本
│       │   ├── V1__initial_schema.sql# 初始表结构
│       │   ├── V2__add_indexes.sql   # 添加索引
│       │   └── ...
│       │
│       ├── seeds/                    # 种子数据
│       │   ├── dev_seeds.sql         # 开发环境数据
│       │   └── test_seeds.sql        # 测试环境数据
│       │
│       └── scripts/                  # 数据库脚本
│           ├── init-db.sh            # 初始化数据库
│           └── ...
│
├── tools/                            # 工具脚本
│   ├── data-generator/               # 模拟数据生成器
│   │   ├── package.json              # 依赖配置
│   │   ├── index.js                  # 主脚本
│   │   ├── generators/               # 生成器
│   │   │   ├── vehicle-generator.js  # 车辆数据生成器
│   │   │   ├── driving-generator.js  # 行驶数据生成器
│   │   │   └── ...
│   │   │
│   │   └── output/                   # 输出目录
│   │       ├── vehicles.json         # 车辆数据
│   │       ├── driving-data.json     # 行驶数据
│   │       └── ...
│   │
│   └── dev-scripts/                  # 开发辅助脚本
│       ├── setup-chain.sh            # 设置区块链环境
│       ├── deploy-contracts.js       # 部署合约
│       └── ...
│
├── .gitignore                        # Git忽略文件
├── LICENSE                           # 许可证
├── README.md                         # 项目说明
├── CONTRIBUTING.md                   # 贡献指南
└── todo.md                           # 项目进度跟踪
```

## 说明

1. **前端结构**采用了React和TypeScript的最佳实践，并使用Vite进行构建，按功能模块划分代码组织：
   - 按照三个平台（管理平台、分析平台、展示平台）组织页面目录
   - 共享组件和工具函数集中管理
   - 使用Redux Toolkit进行状态管理
   - 使用React Query处理API请求和缓存

2. **智能合约结构**遵循Truffle框架规范，采用模块化设计：
   - 合约按功能分类到不同目录
   - 使用接口定义合约之间的交互
   - 完善的测试覆盖
   - 结构化的迁移脚本确保部署顺序

3. **后端结构**采用Spring Boot标准架构，分层设计：
   - 控制器层处理HTTP请求
   - 服务层实现业务逻辑
   - 仓库层处理数据访问
   - 领域模型定义数据结构
   - 工具类和配置集中管理

4. **数据库脚本**采用版本化设计，确保数据库变更可追踪：
   - 使用编号前缀确保执行顺序
   - 分离数据迁移和种子数据
   - 提供初始化和重置脚本

5. **工具和脚本**提供开发和运维辅助：
   - 模拟数据生成器简化测试和开发
   - 开发环境设置脚本确保一致性
   - 部署工具简化上线流程

## 项目文件管理最佳实践

### 文档管理

1. **及时更新文档**：代码变更时同步更新相关文档
2. **版本标记**：在文档中标明适用的版本
3. **保持简洁**：文档应简洁明了，避免冗余

### 代码管理

1. **分支策略**：
   - `main`: 稳定的生产版本
   - `develop`: 开发中的版本
   - `feature/*`: 新功能开发
   - `bugfix/*`: 错误修复
   - `release/*`: 发布准备

2. **提交规范**：
   - `feat`: 新功能
   - `fix`: 错误修复
   - `docs`: 文档更新
   - `style`: 代码风格更改
   - `refactor`: 代码重构
   - `test`: 测试相关
   - `chore`: 构建过程或辅助工具变动

3. **代码审查**：所有合并到主分支的代码必须经过代码审查

### 版本管理

1. **语义化版本**：遵循 `主版本.次版本.修订版本` 格式
2. **更新日志**：维护 CHANGELOG.md 记录所有变更
3. **发布标签**：为每个发布版本创建 Git 标签

## 目录常见问题解答

### Q: 如何添加新功能模块？
A: 在相应层次创建新的目录和文件，遵循现有的命名和组织规范。例如，添加新的车辆数据分析功能应在前端的 `pages/Analysis` 中创建新目录，在后端创建相应的控制器、服务和模型。

### Q: 项目依赖如何管理？
A: 前端和智能合约使用 npm/yarn 管理依赖，后端使用 Gradle 管理依赖。所有依赖应明确版本号，避免使用模糊版本。

### Q: 配置文件如何处理？
A: 敏感配置不应提交到代码库，使用环境变量或配置文件模板（如 `.env.example`）提供示例，实际配置通过 CI/CD 流程或手动部署时提供。

### Q: 如何处理大型静态资源？
A: 大型静态资源应存储在外部服务（如对象存储），而不是直接存储在代码库中。小型常用资源可放在前端的 `assets` 目录。
