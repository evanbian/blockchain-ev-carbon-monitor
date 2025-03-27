# 基于区块链的新能源车辆碳减排计量系统

基于区块链技术的新能源（电动）营运车辆碳减排计量研究与技术支撑系统。通过车载终端获取车辆的行驶数据，结合区块链智能合约集成国标碳减排方法学，计算车辆的碳减排数据并生成碳积分。

## 项目概述

本系统旨在建立一个完整的新能源车辆碳减排监测和积分管理平台。系统主要功能包括：

- 车辆行驶数据采集与上链
- 基于国标方法学的碳减排计算
- 碳积分生成与管理
- 数据分析与可视化展示
- 区块链浏览和数据透明化

## 系统架构

系统由以下几个主要部分组成：

1. **数据采集层**：车载终端设备采集车辆数据
2. **数据处理层**：验证、清洗和标准化数据
3. **区块链层**：基于以太坊PoA私有链的智能合约
4. **应用层**：管理平台、分析平台和展示平台
5. **安全层**：确保数据和系统安全

## 技术栈

- **前端**：React 18、TypeScript、Ant Design、ECharts、GSAP
- **区块链**：以太坊、Solidity、Web3.js
- **后端**：Java/Spring Boot
- **数据库**：PostgreSQL、Redis
- **DevOps**：Docker、GitHub Actions

## 项目结构

```
blockchain-ev-carbon-monitor/
├── docs/                      # 文档目录
│   ├── architecture.md        # 系统架构文档
│   ├── database-design.md     # 数据库设计文档 
│   ├── smart-contract.md      # 智能合约设计文档
│   ├── frontend-design.md     # 前端设计文档
│   ├── api-design.md          # API接口设计文档
│   └── images/                # 文档中使用的图片
│
├── frontend/                  # 前端代码
│   ├── admin-platform/        # 管理平台
│   ├── analysis-platform/     # 分析平台
│   ├── display-platform/      # 展示平台
│   └── shared/                # 共享组件和工具
│
├── smart-contracts/           # 智能合约代码
│   ├── contracts/             # 合约源码
│   ├── migrations/            # 部署脚本
│   └── test/                  # 合约测试
│
├── backend/                   # 后端代码
│   ├── src/                   # 源代码
│   ├── db/                    # 数据库脚本
│   └── test/                  # 测试代码
│
├── tools/                     # 工具脚本
│   ├── data-generator/        # 模拟数据生成器
│   └── dev-scripts/           # 开发辅助脚本
│
├── .github/                   # GitHub配置
│   └── workflows/             # CI/CD配置
│
├── .gitignore                 # Git忽略文件
├── README.md                  # 项目说明
├── LICENSE                    # 许可证
└── todo.md                    # 项目进度跟踪
```

## 安装和运行

### 前置条件

- Node.js 18+
- Java 17+
- PostgreSQL 14+
- Geth或其他以太坊客户端

### 前端开发

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 智能合约开发

```bash
# 进入智能合约目录
cd smart-contracts

# 安装依赖
npm install

# 编译合约
npx truffle compile

# 运行测试
npx truffle test
```

### 后端开发

```bash
# 进入后端目录
cd backend

# 构建项目
./gradlew build

# 运行应用
./gradlew bootRun
```

## 项目进度

详见 [todo.md](todo.md) 文件，跟踪当前开发进度和计划。

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

此项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 联系方式

项目负责人 - [your-email@example.com](mailto:your-email@example.com)

项目链接: [https://github.com/yourusername/blockchain-ev-carbon-monitor](https://github.com/yourusername/blockchain-ev-carbon-monitor)
