# Prism UI 重构设计文档

## 项目概述

重构 Prism 的前端 UI，使用 Airtable 风格的设计系统，并为 bilibili、xiaohongshu、zhihu、hupu、ctrip、taobao 等网站实现专属页面和 OpenCLI 功能封装。

## 设计风格

基于 Airtable 风格的设计系统：

- **背景**：白色 (`#ffffff`)
- **主文字**：深蓝色 (`#181d26`)
- **强调色**：Airtable 蓝 (`#1b61c9`)
- **边框**：浅灰色 (`#e0e2e6`)
- **圆角**：12px（按钮）、16px（卡片）

## 整体架构

```
prism/src/web/
├── App.vue                 # 主应用（侧边导航 + 内容区域）
├── components/
│   ├── common/             # 通用组件
│   │   ├── Sidebar.vue     # 侧边导航栏
│   │   ├── ResultDisplay.vue # 结果展示组件
│   │   ├── ParamForm.vue   # 参数表单组件
│   │   └── FileOutput.vue  # 文件输出配置组件
│   └── sites/              # 网站页面组件
│       ├── BilibiliPage.vue
│       ├── XiaohongshuPage.vue
│       ├── ZhihuPage.vue
│       ├── HupuPage.vue
│       ├── CtripPage.vue
│       └── TaobaoPage.vue
├── styles/
│   └── design-system.css   # Airtable 风格设计系统
└── utils/
    └── adapter-config.ts   # 适配器配置（参数友好化映射）
```

## UI 设计

### 侧边导航栏

- 宽度：240px
- 背景：白色
- 网站图标 + 名称
- 选中状态：蓝色背景 + 白色文字
- 悬停状态：浅蓝色背景

### 内容区域

- 功能卡片：白色背景、16px 圆角、浅灰色边框
- 卡片标题：24px、深蓝色
- 卡片描述：16px、灰色
- 参数表单：清晰的标签 + 输入框
- 执行按钮：蓝色背景、白色文字、12px 圆角

### 结果展示

- 文本结果：白色背景、等宽字体、一键复制按钮
- 表格结果：Ant Design Table 组件
- 文件结果：文件路径输入框 + 下载按钮

## 网站功能设计

### Bilibili

| 功能 | OpenCLI 命令 | 参数 |
|------|-------------|------|
| 热门视频 | `opencli bilibili hot` | limit |
| 搜索视频 | `opencli bilibili search` | keyword, limit |
| 用户视频 | `opencli bilibili user-videos` | uid, limit |
| 收藏夹 | `opencli bilibili favorite` | fid, limit |
| 历史记录 | `opencli bilibili history` | limit |
| 关注动态 | `opencli bilibili feed` | limit |
| 视频详情 | `opencli bilibili video` | bv |
| 视频下载 | `opencli bilibili download` | bv, output |

### 小红书

| 功能 | OpenCLI 命令 | 参数 |
|------|-------------|------|
| 搜索笔记 | `opencli xiaohongshu search` | keyword, limit |
| 笔记详情 | `opencli xiaohongshu note` | url |
| 评论列表 | `opencli xiaohongshu comments` | url, limit |
| 首页推荐 | `opencli xiaohongshu feed` | limit |
| 用户笔记 | `opencli xiaohongshu user` | uid |
| 笔记下载 | `opencli xiaohongshu download` | url, output |

### 知乎

| 功能 | OpenCLI 命令 | 参数 |
|------|-------------|------|
| 热门话题 | `opencli zhihu hot` | limit |
| 搜索内容 | `opencli zhihu search` | keyword, limit |
| 问题回答 | `opencli zhihu question` | id, limit |
| 文章下载 | `opencli zhihu download` | url, output |

### 虎扑

| 功能 | OpenCLI 命令 | 参数 |
|------|-------------|------|
| 热门帖子 | `opencli hupu hot` | limit |
| 搜索帖子 | `opencli hupu search` | keyword, limit |
| 帖子详情 | `opencli hupu detail` | tid |

### 携程

| 功能 | OpenCLI 命令 | 参数 |
|------|-------------|------|
| 搜索 | `opencli ctrip search` | keyword |

### 淘宝

| 功能 | OpenCLI 命令 | 参数 |
|------|-------------|------|
| 搜索商品 | `opencli taobao search` | keyword, limit |
| 商品详情 | `opencli taobao detail` | id |
| 商品评论 | `opencli taobao reviews` | id |
| 购物车 | `opencli taobao cart` | - |

## 参数友好化映射

| 原始参数 | 友好名称 | 类型 | 默认值 |
|---------|----------|------|--------|
| limit | 数量限制 | number | 10 |
| keyword / query | 搜索关键词 | string | - |
| uid / user_id | 用户ID | string | - |
| fid | 收藏夹ID | string | - |
| tid | 帖子ID | string | - |
| id | 内容ID | string | - |
| output | 保存路径 | path | ~/Downloads/ |
| format | 输出格式 | select | table |
| lang | 字幕语言 | select | zh-CN |
| pages | 页数 | number | 1 |
| with-replies | 包含回复 | boolean | false |
| download-images | 下载图片 | boolean | false |

## 结果展示逻辑

### 智能展示

1. **文件结果**
   - 检测：命令输出包含文件路径或下载链接
   - 展示：文件路径输入框（默认：系统下载路径）
   - 操作：选择保存路径 + 下载按钮

2. **表格数据**
   - 检测：返回数据是数组对象
   - 展示：Ant Design Table 组件
   - 操作：排序、筛选、导出 CSV

3. **JSON 数据**
   - 检测：返回数据是 JSON 对象
   - 展示：语法高亮 + 可折叠
   - 操作：一键复制

4. **纯文本**
   - 检测：返回数据是字符串
   - 展示：等宽字体、保留格式
   - 操作：一键复制

### 一键复制功能

- 复制按钮：右上角
- 复制成功提示：Toast 提示
- 支持格式：JSON、表格（CSV）、纯文本

## 后端 API 设计

### API 端点

```
GET  /api/sites                    # 获取支持的网站列表
GET  /api/sites/:site              # 获取网站详情（功能列表）
POST /api/sites/:site/execute      # 执行命令
GET  /api/sites/:site/commands     # 获取网站命令列表
GET  /api/sites/:site/commands/:id # 获取命令详情
```

### 请求格式

```json
POST /api/sites/bilibili/execute
{
  "command": "search",
  "params": {
    "keyword": "黑神话",
    "limit": 10
  }
}
```

### 响应格式

```json
{
  "success": true,
  "type": "table" | "json" | "text" | "file",
  "data": [...],
  "filePath": "/path/to/file"
}
```

## 技术栈

- **前端**：Vue 3 + Ant Design Vue
- **后端**：Express.js
- **设计风格**：Airtable 风格
- **布局**：侧边导航栏 + 内容区域
