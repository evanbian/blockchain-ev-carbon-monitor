# 贡献指南

感谢您对基于区块链的新能源车辆碳减排计量系统项目的关注！我们欢迎各种形式的贡献，包括功能建议、bug报告、代码贡献、文档改进等。本指南将帮助您了解如何参与到项目中来。

## 提交问题

如果您发现了bug或者有功能建议，请按照以下步骤提交问题：

1. 使用GitHub Issues搜索功能检查该问题是否已经被报告
2. 如果没有找到相关问题，创建一个新的issue
3. 请使用清晰的标题并提供详细描述
4. 对于bug报告，请包含：
   - 问题的详细描述
   - 重现步骤
   - 预期行为与实际行为
   - 相关的日志或截图
   - 运行环境信息（操作系统、浏览器版本等）
5. 对于功能建议，请包含：
   - 功能描述
   - 使用场景
   - 可能的实现方式（如有）

## 代码贡献流程

1. 在GitHub上Fork本项目
2. 克隆您的Fork到本地
   ```bash
   git clone https://github.com/YOUR_USERNAME/blockchain-ev-carbon-monitor.git
   ```
3. 创建一个新的分支
   ```bash
   git checkout -b feature/your-feature-name
   # 或者
   git checkout -b fix/your-bug-fix
   ```
4. 进行必要的更改，请遵循我们的编码规范
5. 确保您的代码通过了所有测试
6. 提交您的更改，使用清晰的提交信息
   ```bash
   git commit -m "Add: 简洁描述您的更改"
   ```
7. 将您的更改推送到您的Fork
   ```bash
   git push origin feature/your-feature-name
   ```
8. 在GitHub上创建Pull Request到原项目的主分支

## 编码规范

### 通用规范

- 使用UTF-8字符编码
- 使用LF（Unix）行尾
- 在文件末尾添加一个空行
- 删除尾随空格

### 前端 (React/TypeScript)

- 遵循ESLint配置
- 使用TypeScript类型定义
- 组件采用函数式组件配合React Hooks
- 使用单文件组件模式
- CSS采用模块化方式或Tailwind工具类

### 智能合约 (Solidity)

- 遵循Solidity官方风格指南
- 在合约开始添加SPDX许可证标识
- 为函数和变量添加恰当的可见性修饰符
- 使用合约接口进行模块化设计
- 编写详细的NatSpec文档注释

### 后端 (Java/Spring Boot)

- 遵循Java编码规范
- 使用Spring Boot最佳实践
- 服务和控制器保持单一职责
- 所有API端点都应有适当的错误处理
- 编写单元测试和集成测试

## 文档贡献

文档是项目的重要组成部分，我们非常欢迎文档相关的贡献：

1. 改进现有文档
2. 添加新的教程或指南
3. 修正文档中的错误
4. 翻译文档

## 代码审查标准

提交的代码需要满足以下标准才能被合并：

1. 通过所有自动化测试
2. 遵循项目的编码规范
3. 功能完备且符合需求
4. 包含适当的测试覆盖
5. 文档更新（如适用）

## 行为准则

参与本项目的所有贡献者都需要尊重其他参与者。我们期望所有参与者：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表现出同理心

## 联系方式

如有任何问题，请通过以下方式联系项目维护者：

- Email: [your-email@example.com](mailto:your-email@example.com)
- GitHub Issues

感谢您对项目的贡献！
