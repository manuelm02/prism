# Prism 验证指南

## 前置条件

1. 确保已安装 Node.js (>= 21.0.0)
2. 确保已安装 OpenCLI (`npm install -g @jackwener/opencli`)
3. 确保 Chrome/Chromium 浏览器已安装并运行
4. 确保已安装 OpenCLI 浏览器扩展

## 启动步骤

### 1. 进入项目目录

```bash
cd /Users/manuelm/devspace/workspace/project/prism
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 访问 Web 界面

打开浏览器访问: http://localhost:5173

## 验证功能

### 1. 检查适配器列表

- 页面加载后，下拉框应显示可用的网站适配器
- 如果下拉框为空，请检查 OpenCLI 是否正确安装

### 2. 测试命令执行

1. 选择一个适配器（如 bilibili）
2. 查看可用的操作列表
3. 填写参数并点击执行
4. 查看执行结果

### 3. 检查结果展示

- 文本结果应在页面上直接显示
- 文件结果应显示文件保存路径

## 常见问题

### 1. OpenCLI 未安装

错误信息: "OpenCLI 未安装"

解决方案:
```bash
npm install -g @jackwener/opencli
```

### 2. 浏览器扩展未安装

错误信息: "浏览器未连接"

解决方案:
1. 下载 OpenCLI 浏览器扩展
2. 在 Chrome 中启用开发者模式
3. 加载已解压的扩展程序

### 3. 端口被占用

错误信息: "EADDRINUSE"

解决方案:
```bash
# 使用其他端口启动
npm run dev -- --port 3001
```

### 4. 依赖安装失败

解决方案:
```bash
# 清除缓存并重新安装
rm -rf node_modules package-lock.json
npm install
```

## 构建生产版本

```bash
npm run build
```

构建完成后，前端文件将位于 `dist/web/` 目录。

## 项目结构

```
prism/
├── src/
│   ├── cli/           # CLI 入口
│   ├── server/        # Express 服务
│   ├── web/           # Vue 前端
│   └── utils/         # 工具函数
├── docs/              # 文档
├── package.json       # 项目配置
└── vite.config.ts     # Vite 配置
```

## 技术栈

- **前端**: Vue 3 + Ant Design Vue
- **后端**: Express.js
- **构建工具**: Vite
- **CLI**: Commander.js
- **语言**: TypeScript
