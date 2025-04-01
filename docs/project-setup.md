# 项目环境搭建指南

本文档提供了基于区块链的新能源车辆碳减排计量系统的环境搭建步骤，包括前端、智能合约和后端的开发环境配置。

## 开发环境要求

### 通用要求
- Git
- Node.js v18+ 和 npm v9+
- Docker 和 Docker Compose (可选，用于容器化开发环境)

### 前端开发
- Visual Studio Code 或其他现代IDE
- 推荐VS Code插件:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - vscode-styled-components

### 智能合约开发
- Truffle v5.8+
- Ganache (用于本地区块链开发)
- MetaMask浏览器扩展
- Solidity插件

### 后端开发
- JDK 17+
- PostgreSQL 14+
- IntelliJ IDEA 或其他Java IDE
- Gradle 7.5+

## 环境搭建步骤

### 1. 克隆项目

```bash
# 克隆项目仓库
git clone https://github.com/yourusername/blockchain-ev-carbon-monitor.git

# 进入项目目录
cd blockchain-ev-carbon-monitor
```

### 2. 前端环境设置

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 创建本地环境配置
cp .env.example .env.local

# 启动开发服务器
npm run dev
```

前端环境配置文件(.env.local)示例:

```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WEB3_PROVIDER=http://localhost:8545
VITE_DEFAULT_CHAIN_ID=1337
```

### 3. 智能合约环境设置

#### 3.1 启动本地区块链

方法1: 使用Ganache UI

1. 下载并安装[Ganache](https://trufflesuite.com/ganache/)
2. 创建新的工作区，设置端口为8545
3. 配置高级选项，设置Gas限制和Gas价格

方法2: 使用Ganache CLI

```bash
# 全局安装Ganache CLI
npm install -g ganache

# 启动本地区块链
ganache --port 8545 --gasLimit 8000000 --accounts 10 --deterministic
```

#### 3.2 配置并部署智能合约

```bash
# 进入智能合约目录
cd smart-contracts

# 安装依赖
npm install

# 创建配置文件
cp .env.example .env

# 编译合约
npx truffle compile

# 部署到本地区块链
npx truffle migrate --network development
```

智能合约环境配置文件(.env)示例:

```
INFURA_API_KEY=your_infura_key
PRIVATE_KEY=your_private_key_for_testnet_deployment
ETHERSCAN_API_KEY=your_etherscan_key
```

#### 3.3 MetaMask配置

1. 在浏览器中安装MetaMask扩展
2. 创建或导入钱包
3. 添加本地网络配置:
   - 网络名称: Ganache Local
   - RPC URL: http://localhost:8545
   - 链ID: 1337
   - 货币符号: ETH
4. 导入本地区块链账户(使用Ganache提供的私钥)

### 4. 后端环境设置

#### 4.1 数据库设置

```bash
# 创建PostgreSQL数据库
createdb evcarbonmonitor

# 或者使用Docker启动PostgreSQL
docker run --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=evcarbonmonitor -p 5432:5432 -d postgres:14
```

#### 4.2 配置并启动后端服务

```bash
# 进入后端目录
cd backend

# 选择本地配置文件
application.yml中修改spring.profiles.active的值为dev，即选择应用application-dev.yml配置文件

# 使用Gradle启动应用
./gradlew bootRun
```

后端配置文件(application-dev.yml)示例:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/evcarbonmonitor
    username: postgres
    password: password
  jpa:
    hibernate:
      ddl-auto: update

blockchain:
  web3-provider: http://localhost:8545
  contract-addresses:
    access-control: '0x...'
    vehicle-registry: '0x...'
    carbon-calculator: '0x...'
    credits-generator: '0x...'
    credits-manager: '0x...'
    contract-manager: '0x...'

security:
  jwt:
    secret-key: your_jwt_secret_key
    expiration-time: 86400000
```

### 5. 模拟数据生成

```bash
# 进入工具目录
cd tools/data-generator

# 安装依赖
npm install

# 生成模拟数据
npm run generate-all

# 导入模拟数据到数据库
npm run import-to-db
```

### 6. 验证环境

1. 前端访问: http://localhost:5173/
2. 后端API: http://localhost:8080/api/v1/status
3. 区块链: 确认使用Truffle Console可以与智能合约交互

```bash
# 在smart-contracts目录下
npx truffle console --network development

# 在Truffle控制台中
const accessControl = await AccessControl.deployed()
const accounts = await web3.eth.getAccounts()
await accessControl.hasRole(web3.utils.keccak256('ADMIN_ROLE'), accounts[0])
# 应返回true
```

## Docker开发环境(可选)

为简化环境配置，项目提供了Docker Compose配置:

```bash
# 启动完整的开发环境
docker-compose -f docker-compose.dev.yml up -d

# 查看服务状态
docker-compose -f docker-compose.dev.yml ps

# 查看服务日志
docker-compose -f docker-compose.dev.yml logs -f
```

Docker环境包含:
- PostgreSQL数据库
- Ganache本地区块链
- 后端Spring Boot应用
- 前端开发服务器

## 常见问题解决

### 1. 前端无法连接到后端API

检查:
- 后端服务是否正常运行
- 跨域设置是否配置正确
- 环境变量`VITE_API_BASE_URL`是否正确设置

### 2. 智能合约部署失败

检查:
- Ganache是否正常运行
- Truffle配置文件中网络设置是否正确
- Gas限制是否足够

### 3. 后端无法连接到数据库

检查:
- 数据库是否运行
- 数据库连接配置是否正确
- 数据库用户权限是否正确设置

### 4. 后端无法连接到区块链

检查:
- 区块链节点是否运行
- Web3Provider URL是否配置正确
- 智能合约地址是否正确配置

## 下一步

成功搭建环境后，可以:

1. 查阅`todo.md`了解项目当前状态和下一步计划
2. 查看`docs/`目录下的详细设计文档
3. 开始实现分配的任务或功能

如有任何环境配置问题，请查阅各技术官方文档或联系项目维护者。
