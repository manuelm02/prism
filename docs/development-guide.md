# Prism 本地开发调试指南

## 前置条件

1. **安装 Node.js** (>= 21.0.0)
2. **安装 OpenCLI**:
   ```bash
   npm install -g @jackwener/opencli
   ```
3. **安装 Chrome/Chromium 浏览器**
4. **安装 OpenCLI 浏览器扩展**:
   - 下载最新 `opencli-extension-v{version}.zip` from https://github.com/jackwener/OpenCLI/releases
   - 解压后，打开 `chrome://extensions`
   - 启用"开发者模式"
   - 点击"加载已解压的扩展程序"，选择解压后的文件夹

## 项目结构

```
prism/
├── src/
│   ├── cli/                    # CLI 入口
│   ├── server/                 # Express 后端服务
│   │   ├── index.ts            # 服务器入口
│   │   ├── routes/             # API 路由
│   │   │   ├── adapters.ts     # 适配器路由
│   │   │   └── execute.ts      # 执行路由
│   │   └── services/           # 服务层
│   │       └── opencli.ts      # OpenCLI 集成
│   ├── web/                    # Vue 前端
│   │   ├── App.vue             # 主应用
│   │   ├── components/         # 组件
│   │   │   ├── common/         # 通用组件
│   │   │   └── sites/          # 网站页面
│   │   ├── styles/             # 样式
│   │   └── utils/              # 工具函数
│   └── utils/                  # 共享类型
└── package.json
```

## 本地调试步骤

### 方式一：分别启动前后端（推荐调试）

**终端 1 - 启动后端服务：**

```bash
cd /Users/manuelm/devspace/workspace/project/prism
npm run dev:server
```

输出应该显示：
```
Prism server running on port 3000
API available at http://localhost:3000/api
```

**终端 2 - 启动前端服务：**

```bash
cd /Users/manuelm/devspace/workspace/project/prism
npm run dev:web
```

输出应该显示：
```
VITE v8.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**访问应用：**

打开浏览器访问 http://localhost:5173

### 方式二：同时启动前后端

```bash
cd /Users/manuelm/devspace/workspace/project/prism
npm run dev
```

这会同时启动后端（端口 3000）和前端（端口 5173）。

## API 端点

### 后端 API (http://localhost:3000)

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/sites` | GET | 获取支持的网站列表 |
| `/api/sites/:site` | GET | 获取网站详情（包含命令列表） |
| `/api/sites/:site/execute` | POST | 执行网站命令 |

### 执行命令示例

```bash
# 获取网站列表
curl http://localhost:3000/api/sites

# 获取 Bilibili 详情
curl http://localhost:3000/api/sites/bilibili

# 执行 Bilibili 热门视频命令
curl -X POST http://localhost:3000/api/sites/bilibili/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "hot", "params": {"limit": 5}}'

# 执行 Bilibili 搜索命令
curl -X POST http://localhost:3000/api/sites/bilibili/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "search", "params": {"keyword": "黑神话", "limit": 5}}'
```

## 常见问题

### 1. 前端报错：`ECONNREFUSED`

**原因：** 后端服务没有启动

**解决方案：**
```bash
# 确保后端服务正在运行
npm run dev:server
```

### 2. 命令执行失败：`OpenCLI not found`

**原因：** OpenCLI 没有安装

**解决方案：**
```bash
npm install -g @jackwener/opencli
```

### 3. 命令执行失败：`Browser not connected`

**原因：** Chrome 浏览器没有运行，或者 OpenCLI 扩展没有安装

**解决方案：**
1. 确保 Chrome 浏览器正在运行
2. 确保 OpenCLI 浏览器扩展已安装并启用
3. 访问 `chrome://extensions` 检查扩展状态

### 4. 命令执行失败：`Unauthorized` 或返回空数据

**原因：** 用户没有登录目标网站

**解决方案：**
1. 在 Chrome 中打开目标网站（如 bilibili.com）
2. 登录账号
3. 重新执行命令

### 5. 前端页面空白或报错

**原因：** TypeScript 编译错误或组件导入问题

**解决方案：**
```bash
# 检查 TypeScript 错误
npm run build

# 清除缓存重新启动
rm -rf node_modules/.vite
npm run dev:web
```

### 6. 端口被占用

**原因：** 3000 或 5173 端口已被其他进程使用

**解决方案：**
```bash
# 查找占用端口的进程
lsof -i :3000
lsof -i :5173

# 杀死进程
kill -9 <PID>

# 或使用其他端口
PORT=3001 npm run dev:server
```

## 调试技巧

### 1. 查看后端日志

后端服务会输出执行的 OpenCLI 命令：
```
Executing: opencli bilibili hot --limit 5
```

### 2. 查看网络请求

在浏览器开发者工具中：
1. 打开 Network 标签
2. 筛选 `/api` 请求
3. 查看请求和响应内容

### 3. 测试 OpenCLI 命令

在终端直接测试 OpenCLI 命令：
```bash
# 测试 OpenCLI 是否安装
opencli --version

# 测试 Bilibili 热门视频
opencli bilibili hot --limit 5

# 测试 Bilibili 搜索
opencli bilibili search 黑神话 --limit 5
```

### 4. 检查浏览器扩展状态

```bash
# 检查 OpenCLI 扩展是否连接
opencli doctor
```

## 开发工作流

### 修改前端代码

1. 修改 `src/web/` 下的文件
2. Vite 会自动热更新
3. 刷新浏览器查看效果

### 修改后端代码

1. 修改 `src/server/` 下的文件
2. 重启后端服务：`Ctrl+C` 然后 `npm run dev:server`
3. 测试 API 端点

### 修改适配器配置

1. 修改 `src/web/utils/adapter-config.ts`
2. 前端会自动更新
3. 后端需要重启

## 构建生产版本

```bash
# 构建前端
npm run build

# 构建后的文件在 dist/web/ 目录
```

## 项目依赖

### 生产依赖
- `vue` - Vue 3 框架
- `ant-design-vue` - UI 组件库
- `express` - 后端框架
- `cors` - 跨域支持
- `commander` - CLI 框架

### 开发依赖
- `typescript` - TypeScript 编译器
- `vite` - 前端构建工具
- `vue-tsc` - Vue TypeScript 检查
- `tsx` - TypeScript 执行器
- `@types/*` - 类型定义

## 下一步

1. 确保所有前置条件已满足
2. 按照步骤启动前后端服务
3. 访问 http://localhost:5173
4. 选择一个网站，测试命令执行
