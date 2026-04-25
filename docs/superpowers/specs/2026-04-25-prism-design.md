# Prism 设计文档

## 项目概述

Prism 是一个为 OpenCLI 提供 Web UI 的工具，让用户可以通过可视化界面操作 OpenCLI 的所有网站适配器功能。用户无需记忆命令行参数，只需通过鼠标点击和输入参数即可获取结果。

## 技术栈

- **项目名称**：Prism
- **技术栈**：Node.js CLI + Web 服务
- **架构**：单体架构
- **前端**：Vue 3 + Ant Design Vue
- **后端**：Express.js
- **构建工具**：Vite
- **CLI 框架**：Commander.js

## 架构设计

### 整体架构

```
prism/
├── src/
│   ├── cli/           # CLI 入口
│   ├── server/        # Web 服务
│   ├── web/           # 前端静态资源
│   └── utils/         # 工具函数
├── package.json
├── tsconfig.json
└── README.md
```

### 工作流程

1. 用户通过 npm 安装 Prism
2. 在终端输入 `prism` 命令启动
3. CLI 启动 Express 服务，并自动打开浏览器
4. 用户在 Web 界面选择网站和操作
5. 填写参数，执行命令
6. 查看结果（文本展示或文件生成到指定路径）

## CLI 设计

### 命令格式

```bash
prism [options]
```

### 选项

- `-p, --port <port>`：指定 Web 服务端口（默认 3000）
- `-h, --host <host>`：指定 Web 服务主机（默认 localhost）
- `--no-open`：不自动打开浏览器
- `-v, --version`：显示版本号
- `--help`：显示帮助信息

### 功能

- 启动 Express 服务
- 自动打开浏览器
- 监听端口
- 优雅关闭

## 后端 API 设计

### API 端点

- `GET /api/adapters`：获取所有适配器列表
- `GET /api/adapters/:adapter`：获取适配器详情
- `GET /api/adapters/:adapter/commands`：获取适配器命令列表
- `GET /api/adapters/:adapter/commands/:command`：获取命令详情
- `POST /api/adapters/:adapter/commands/:command/execute`：执行命令

### 数据格式

- 适配器列表：`[{ name, description, commands }]`
- 命令详情：`{ name, description, parameters, outputFormat }`
- 执行结果：`{ success, data, filePath }`

## 前端界面设计

### 页面结构

1. **主页**：一个下拉框，让用户选择网站（如 bilibili、hackernews 等）
2. **选择网站后**：页面下方展示该网站支持的所有操作
3. **每个操作**：直接显示需要填写的用户友好参数表单
4. **执行按钮**：每个操作旁边有执行按钮
5. **结果展示**：执行后直接在操作下方显示结果

### 参数友好化

将命令行参数转换为用户友好的文字参数名：

- `limit` → "数量限制"
- `format` → "输出格式"
- `keyword` → "搜索关键词"
- `--output` → "保存路径"

### 示例布局

```
[选择网站: bilibili ▼]

--- bilibili 操作 ---

🔥 热门视频
  数量限制: [5] 输出格式: [表格 ▼]
  [执行] [结果区域]

🔍 搜索
  搜索关键词: [____] 数量限制: [10]
  [执行] [结果区域]
```

## OpenCLI 集成设计

### 集成方式

- 后端通过子进程调用 OpenCLI 命令
- 解析 OpenCLI 的输出结果（JSON、CSV、表格等格式）
- 将结果转换为前端可以展示的格式

### 结果处理方式

- **文件结果**：生成到指定路径（如 `./prism-output/`），并在页面显示文件路径
- **文本结果**：直接在页面用文本框格式化展示（支持 JSON、表格、纯文本等格式）

### 输出路径配置

- 默认输出路径：`./prism-output/`
- 用户可在页面配置输出路径
- 支持自动创建目录

### 文本格式化

- JSON：语法高亮，可折叠
- 表格：使用 Ant Design Table 组件展示
- 纯文本：等宽字体，保留格式

### 前置条件检查

- 检查 OpenCLI 是否已安装
- 检查浏览器扩展是否已安装
- 检查用户是否已登录目标网站

## 错误处理和用户体验设计

### 加载状态

- 执行命令时显示加载动画
- 支持取消操作

### 错误提示

- 友好的错误信息（如 "OpenCLI 未安装"、"浏览器未连接"）
- 提供解决方案链接

### 空状态

- 无数据时显示提示信息
- 引导用户进行操作

### 成功提示

- 操作成功后显示成功信息
- 文件结果显示文件路径

### 响应式设计

- 支持桌面和移动端
- 自适应布局

## 项目初始化

### 创建项目目录

```bash
mkdir prism
cd prism
```

### 初始化 npm 项目

```bash
npm init -y
```

### 安装依赖

```bash
# 后端依赖
npm install express cors

# 前端依赖
npm install vue@next ant-design-vue@next

# 开发依赖
npm install -D vite @vitejs/plugin-vue typescript
```

## 总结

Prism 是一个为 OpenCLI 提供 Web UI 的工具，采用 Node.js CLI + Web 服务的单体架构，使用 Vue 3 + Ant Design Vue 作为前端，Express.js 作为后端。用户可以通过简单的界面操作 OpenCLI 的所有网站适配器功能，无需记忆命令行参数。
