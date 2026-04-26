# Prism - 可视化网页数据采集工具

Prism 是一个为 [OpenCLI](https://github.com/opencli/opencli) 提供的图形化界面工具，让非技术用户也能轻松采集网页数据。

## ✨ 功能特性

- 🎯 **可视化操作** - 无需命令行，通过网页界面完成所有操作
- 📦 **多平台支持** - 支持小红书、哔哩哔哩、淘宝、携程等主流平台
- 🔍 **内容搜索** - 搜索视频、笔记、商品等内容
- 📥 **数据下载** - 下载视频、图片等资源
- 📊 **结果展示** - 表格化展示查询结果，支持导出

## 📋 前置条件

### 必需

1. **Node.js 18.0 或更高版本**
   - 检查方法：在终端运行 `node -v`
   - 安装方法：访问 [nodejs.org](https://nodejs.org/) 下载安装

2. **OpenCLI**
   - 安装方法：`npm install -g opencli`
   - 验证安装：运行 `opencli --version`

### 可选（用于登录态功能）

- Chrome 浏览器（用于获取登录 Cookie）

## 🚀 安装

### 方式一：npm 全局安装（推荐）

```bash
npm install -g @manuelm02/prism-cli
```

### 方式二：从源码安装

```bash
git clone https://github.com/your-repo/prism.git
cd prism
npm install
npm run build
npm link
```

## 📖 使用方法

### 启动 Prism

安装完成后，在终端运行：

```bash
prism
```

程序会自动：
1. 启动本地服务器
2. 打开浏览器访问 `http://localhost:3000`

### 使用界面

1. **选择平台** - 左侧边栏选择要操作的平台（小红书、B站、淘宝、携程）
2. **选择功能** - 下拉菜单选择具体操作（搜索、下载、获取详情等）
3. **填写信息** - 根据提示填写必要参数
4. **开始查询** - 点击按钮执行操作
5. **查看结果** - 结果以表格形式展示，可进行后续操作

### 停止服务

在终端按 `Ctrl + C` 停止服务

## 🛠️ 开发

### 开发模式

```bash
# 安装依赖
npm install

# 启动开发服务器（前端 + 后端）
npm run dev

# 或分别启动
npm run dev:web    # 前端开发服务器
npm run dev:server # 后端开发服务器
```

### 构建

```bash
npm run build
```

构建产物：
- `dist/web/` - 前端静态文件
- `dist/server/` - 后端代码
- `dist/cli/` - CLI 入口

## 📁 项目结构

```
prism/
├── src/
│   ├── cli/           # CLI 入口
│   ├── server/        # 后端服务
│   │   ├── routes/    # API 路由
│   │   └── services/  # 业务逻辑
│   └── web/           # 前端代码
│       ├── components/
│       ├── views/
│       └── utils/
├── dist/              # 构建产物
└── package.json
```

## 🔧 配置

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| PORT | 服务端口 | 3000 |

### 自定义端口

```bash
PORT=8080 prism
```

## ❓ 常见问题

### Q: 提示"未找到 OpenCLI"

确保已安装 OpenCLI：
```bash
npm install -g opencli
opencli --version  # 验证安装
```

### Q: 端口被占用

程序会自动尝试下一个端口，或手动指定：
```bash
PORT=8080 prism
```

### Q: macOS 提示"无法验证开发者"

运行以下命令允许执行：
```bash
sudo xattr -r -d com.apple.quarantine $(which prism)
```

## 📦 发布流程（开发者）

### 发布到 npm

```bash
# 1. 登录 npm 账号
npm login

# 2. 构建并发布
npm run build
npm publish

# 3. 验证发布成功
npm info @manuelm02/prism-cli
```

### 本地测试（发布前）

```bash
# 构建项目
npm run build

# 本地链接测试
npm link

# 测试命令
prism

# 取消链接
npm unlink -g prism-cli
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
