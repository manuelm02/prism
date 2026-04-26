# Prism 快速启动指南

## 一键启动

### 方式一：分别启动（推荐调试）

**终端 1 - 后端：**
```bash
cd /Users/manuelm/devspace/workspace/project/prism
npm run dev:server
```

**终端 2 - 前端：**
```bash
cd /Users/manuelm/devspace/workspace/project/prism
npm run dev:web
```

然后访问：http://localhost:5173

### 方式二：同时启动

```bash
cd /Users/manuelm/devspace/workspace/project/prism
npm run dev
```

## 验证后端是否正常

```bash
# 测试 Bilibili 热门视频
curl -X POST http://localhost:3000/api/sites/bilibili/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "bilibili-hot", "params": {"limit": 3}}'
```

## 常见问题

### 1. 前端报错 `ECONNREFUSED`
后端没有启动，运行 `npm run dev:server`

### 2. 命令执行失败 `OpenCLI not found`
安装 OpenCLI：`npm install -g @jackwener/opencli`

### 3. 返回空数据或 `Unauthorized`
在 Chrome 中登录目标网站（如 bilibili.com）

### 4. 浏览器扩展未连接
安装 OpenCLI 浏览器扩展，参考 `docs/development-guide.md`
