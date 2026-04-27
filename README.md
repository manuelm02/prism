# Prism - 可视化网页数据采集工具

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0-brightgreen.svg)](https://nodejs.org/)

Prism 是一个为 [OpenCLI](https://github.com/jackwener/OpenCLI) 提供的图形化界面工具，让非技术用户也能轻松采集网页数据。

> **声明**：本项目源于个人兴趣与探索精神，旨在为技术实践提供一个有趣的尝试。作为一个业余时间的灵感产物，它承载着对开源社区的热爱与回馈。希望能为有同样需求的用户带来便利，也欢迎志同道合的朋友一起交流改进。

## ✨ 功能特性

- 🎯 **可视化操作** - 无需命令行，通过网页界面完成所有操作
- 📦 **多平台支持** - 支持小红书、哔哩哔哩、淘宝、携程等主流平台
- 🔍 **内容搜索** - 搜索视频、笔记、商品等内容
- 📥 **数据下载** - 下载视频、图片等资源
- 📊 **结果展示** - 表格化展示查询结果，支持导出

## 📋 前置条件

### 必需

| 条件 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | >= 18.0 | JavaScript 运行环境 |
| OpenCLI | 最新版 | 网页数据采集核心工具 |
| Chrome 浏览器 | 任意版本 | 用于运行 OpenCLI 浏览器扩展 |
| OpenCLI 浏览器扩展 | 最新版 | 提供登录态管理，大部分功能必需 |

## 🚀 快速安装

### 方式一：一键安装（推荐）

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/manuelm02/prism/main/scripts/install.sh | bash
```

或下载后运行：
```bash
chmod +x scripts/install.sh
./scripts/install.sh
```

**Windows:**
下载 `scripts/install.bat` 后双击运行，或在命令行执行：
```cmd
scripts\install.bat
```

### 方式二：npm 全局安装

```bash
# 1. 安装 OpenCLI（必需）
npm install -g @jackwener/opencli

# 2. 安装 Prism
npm install -g @manuelm02/prism-cli
```

然后按照下方「详细安装教程」安装 OpenCLI 浏览器扩展。

### 方式三：从源码安装

```bash
# 克隆仓库
git clone https://github.com/manuelm02/prism.git
cd prism

# 安装依赖
npm install

# 构建
npm run build

# 全局链接（可选，方便本地测试）
npm link
```

## 📖 使用方法

### 启动 Prism

安装完成后，在终端运行：

```bash
prism
```

程序会自动：
1. 检测 OpenCLI 安装状态
2. 启动本地服务器
3. 打开浏览器访问 `http://localhost:3000`

### 使用界面

| 步骤 | 操作 |
|------|------|
| 1 | 左侧边栏选择平台（小红书、B站、淘宝、携程） |
| 2 | 下拉菜单选择操作类型（搜索、下载、详情等） |
| 3 | 根据提示填写参数 |
| 4 | 点击按钮执行操作 |
| 5 | 查看表格形式的结果 |

### 停止服务

在终端按 `Ctrl + C` 停止服务

## 🔧 详细安装教程

### 1. 安装 Node.js

**macOS:**
```bash
# 使用 Homebrew（推荐）
brew install node

# 或使用 nvm（可管理多版本）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

**Linux (Ubuntu/Debian):**
```bash
# 使用 apt
sudo apt update
sudo apt install nodejs npm

# 或使用 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

**Windows:**
1. 访问 https://nodejs.org/
2. 下载 LTS 版本安装包
3. 运行安装程序，按提示完成安装

**验证安装:**
```bash
node -v   # 应显示 v18.x.x 或更高
npm -v    # 应显示 npm 版本号
```

### 2. 安装 OpenCLI

```bash
npm install -g @jackwener/opencli
```

**验证安装:**
```bash
opencli --version
```

**测试功能:**
```bash
# 测试 B站热门视频（无需登录）
opencli bilibili hot --limit 5
```

### 3. 安装 OpenCLI 浏览器扩展（必需）

OpenCLI 需要浏览器扩展来管理登录态，大部分功能都依赖它运行。

**安装步骤:**
1. 访问 https://github.com/jackwener/OpenCLI/releases
2. 下载最新的 `opencli-extension-v{version}.zip`
3. 解压下载的文件
4. 打开 Chrome，访问 `chrome://extensions`
5. 启用右上角的「开发者模式」
6. 点击「加载已解压的扩展程序」
7. 选择解压后的文件夹

**验证扩展:**
```bash
opencli doctor
```

### 4. 登录目标网站

需要登录态的功能，请先在 Chrome 浏览器中登录对应网站：

| 平台 | 登录地址 |
|------|----------|
| 小红书 | https://www.xiaohongshu.com |
| 哔哩哔哩 | https://www.bilibili.com |
| 淘宝 | https://www.taobao.com |
| 携程 | https://www.ctrip.com |

## 🛠️ 开发指南

### 开发模式

```bash
# 安装依赖
npm install

# 同时启动前后端
npm run dev

# 或分别启动
npm run dev:server  # 后端 (端口 3000)
npm run dev:web     # 前端 (端口 5173)
```

### 构建

```bash
npm run build
```

构建产物：
- `dist/web/` - 前端静态文件
- `dist/server/` - 后端代码
- `dist/cli/` - CLI 入口

### 项目结构

```
prism/
├── src/
│   ├── cli/           # CLI 入口
│   ├── server/        # Express 后端
│   │   ├── routes/    # API 路由
│   │   └── services/  # OpenCLI 服务
│   └── web/           # Vue 前端
│       ├── components/
│       ├── utils/
│       └── styles/
├── scripts/           # 安装脚本
│   ├── install.sh     # macOS/Linux 安装
│   ├── install.bat    # Windows 安装
│   └── build.mjs      # 构建脚本
├── dist/              # 构建产物
└── package.json
```

## ❓ 常见问题

### Q: 提示「未找到 OpenCLI」

确保已正确安装 OpenCLI：
```bash
npm install -g @jackwener/opencli
opencli --version  # 验证安装
```

如果已安装但仍报错，可能是 PATH 问题：
```bash
# macOS/Linux
export PATH="$PATH:/usr/local/bin"

# Windows
# 确保 npm 全局安装目录在 PATH 中
npm config get prefix
```

### Q: 端口被占用

程序会自动尝试下一个端口，或手动指定：
```bash
PORT=8080 prism
```

### Q: macOS 提示「无法验证开发者」

运行以下命令允许执行：
```bash
sudo xattr -r -d com.apple.quarantine $(which prism)
```

### Q: 返回空数据或「Unauthorized」

需要登录目标网站：
1. 在 Chrome 中打开目标网站（如 bilibili.com）
2. 登录账号
3. 重新执行命令

### Q: Windows 安装失败

确保以管理员权限运行：
1. 右键点击 `install.bat`
2. 选择「以管理员身份运行」

## 📦 发布说明

### npm 发布流程

```bash
# 登录 npm
npm login

# 构建并发布
npm run build
npm publish

# 验证发布
npm info @manuelm02/prism-cli
```

### 本地测试

```bash
npm run build
npm link
prism
npm unlink -g prism-cli
```

## 📄 许可证

[MIT License](LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📞 支持

- 问题反馈：[GitHub Issues](https://github.com/manuelm02/prism/issues)
- 功能建议：[GitHub Discussions](https://github.com/manuelm02/prism/discussions)