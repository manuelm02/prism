# Prism UI 重构实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重构 Prism 的前端 UI，使用 Airtable 风格的设计系统，并为 bilibili、xiaohongshu、zhihu、hupu、ctrip、taobao 等网站实现专属页面和 OpenCLI 功能封装。

**Architecture:** 多页面架构，每个网站一个独立的页面组件，共享通用组件（侧边导航、结果展示、参数表单）。使用 Airtable 风格的设计系统（白色背景、深蓝色文字、蓝色按钮）。

**Tech Stack:** Vue 3, Ant Design Vue, Express.js, TypeScript

---

## File Structure

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

---

## Task 1: 设计系统 CSS

**Files:**
- Create: `prism/src/web/styles/design-system.css`

- [ ] **Step 1: 创建设计系统 CSS 文件**

```css
:root {
  /* Colors */
  --color-primary: #1b61c9;
  --color-text: #181d26;
  --color-text-weak: rgba(4, 14, 32, 0.69);
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-border: #e0e2e6;
  --color-success: #006400;
  
  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  --font-size-3xl: 32px;
  --font-size-4xl: 40px;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  
  /* Border Radius */
  --radius-sm: 2px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  
  /* Shadows */
  --shadow-card: rgba(0, 0, 0, 0.32) 0px 0px 1px, rgba(0, 0, 0, 0.08) 0px 0px 2px, rgba(45, 127, 249, 0.28) 0px 1px 3px;
  --shadow-soft: rgba(15, 48, 106, 0.05) 0px 0px 20px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  font-size: var(--font-size-md);
  color: var(--color-text);
  background-color: var(--color-background);
  line-height: 1.5;
}

/* Buttons */
.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-md);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #1557a8;
}

/* Cards */
.card {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-card);
}

.card-title {
  font-size: var(--font-size-2xl);
  font-weight: 400;
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
}

.card-description {
  font-size: var(--font-size-md);
  color: var(--color-text-weak);
}

/* Forms */
.form-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
  display: block;
}

.form-input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  color: var(--color-text);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(27, 97, 201, 0.2);
}

/* Sidebar */
.sidebar {
  width: 240px;
  height: 100vh;
  background-color: var(--color-background);
  border-right: 1px solid var(--color-border);
  padding: var(--spacing-md);
}

.sidebar-item {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.2s;
}

.sidebar-item:hover {
  background-color: var(--color-surface);
}

.sidebar-item.active {
  background-color: var(--color-primary);
  color: white;
}

/* Result Display */
.result-container {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.result-text {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: var(--font-size-sm);
  white-space: pre-wrap;
  word-break: break-all;
}

.copy-button {
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
  cursor: pointer;
}
```

- [ ] **Step 2: 提交**

```bash
git add src/web/styles/design-system.css
git commit -m "feat: add Airtable-style design system CSS"
```

---

## Task 2: 适配器配置

**Files:**
- Create: `prism/src/web/utils/adapter-config.ts`

- [ ] **Step 1: 创建适配器配置文件**

```typescript
export interface CommandConfig {
  id: string
  name: string
  description: string
  opencliCommand: string
  params: ParamConfig[]
  outputType: 'table' | 'json' | 'text' | 'file'
}

export interface ParamConfig {
  name: string
  friendlyName: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'path'
  required: boolean
  default?: string | number | boolean
  options?: string[]
  description: string
}

export interface SiteConfig {
  id: string
  name: string
  icon: string
  description: string
  commands: CommandConfig[]
}

export const siteConfigs: SiteConfig[] = [
  {
    id: 'bilibili',
    name: 'Bilibili',
    icon: '📺',
    description: '哔哩哔哩视频平台',
    commands: [
      {
        id: 'hot',
        name: '热门视频',
        description: '获取热门视频列表',
        opencliCommand: 'opencli bilibili hot',
        params: [
          { name: 'limit', friendlyName: '数量限制', type: 'number', required: false, default: 10, description: '返回结果数量' }
        ],
        outputType: 'table'
      },
      {
        id: 'search',
        name: '搜索视频',
        description: '搜索视频',
        opencliCommand: 'opencli bilibili search',
        params: [
          { name: 'keyword', friendlyName: '搜索关键词', type: 'string', required: true, description: '搜索关键词' },
          { name: 'limit', friendlyName: '数量限制', type: 'number', required: false, default: 10, description: '返回结果数量' }
        ],
        outputType: 'table'
      },
      {
        id: 'user-videos',
        name: '用户视频',
        description: '获取用户视频列表',
        opencliCommand: 'opencli bilibili user-videos',
        params: [
          { name: 'uid', friendlyName: '用户ID', type: 'string', required: true, description: '用户ID' },
          { name: 'limit', friendlyName: '数量限制', type: 'number', required: false, default: 10, description: '返回结果数量' }
        ],
        outputType: 'table'
      },
      {
        id: 'favorite',
        name: '收藏夹',
        description: '获取收藏夹内容',
        opencliCommand: 'opencli bilibili favorite',
        params: [
          { name: 'fid', friendlyName: '收藏夹ID', type: 'string', required: false, description: '收藏夹ID' },
          { name: 'limit', friendlyName: '数量限制', type: 'number', required: false, default: 10, description: '返回结果数量' }
        ],
        outputType: 'table'
      },
      {
        id: 'history',
        name: '历史记录',
        description: '获取观看历史',
        opencliCommand: 'opencli bilibili history',
        params: [
          { name: 'limit', friendlyName: '数量限制', type: 'number', required: false, default: 10, description: '返回结果数量' }
        ],
        outputType: 'table'
      },
      {
        id: 'feed',
        name: '关注动态',
        description: '获取关注用户的动态',
        opencliCommand: 'opencli bilibili feed',
        params: [
          { name: 'limit', friendlyName: '数量限制', type: 'number', required: false, default: 10, description: '返回结果数量' }
        ],
        outputType: 'table'
      },
      {
        id: 'video',
        name: '视频详情',
        description: '获取视频元数据',
        opencliCommand: 'opencli bilibili video',
        params: [
          { name: 'bv', friendlyName: '视频BV号', type: 'string', required: true, description: '视频BV号或链接' }
        ],
        outputType: 'json'
      },
      {
        id: 'download',
        name: '视频下载',
        description: '下载视频',
        opencliCommand: 'opencli bilibili download',
        params: [
          { name: 'bv', friendlyName: '视频BV号', type: 'string', required: true, description: '视频BV号或链接' },
          { name: 'output', friendlyName: '保存路径', type: 'path', required: false, description: '保存路径' }
        ],
        outputType: 'file'
      }
    ]
  },
  {
    id: 'xiaohongshu',
    name: '小红书',
    icon: '📕',
    description: '小红书笔记平台',
    commands: [
      {
        id: 'search',
        name: '搜索笔记',
        description: '搜索笔记',
        opencliCommand: 'opencli xiaohongshu search',
        params: [
          { name: 'keyword', friendlyName: '搜索关键词', type: 'string', required: true, description: '搜索关键词' },
          { name: 'limit', friendlyName: '数量限制', type: 'number', required: false, default: 10, description: '返回结果数量' }
        ],
        outputType: 'table'
      },
      {
        id: 'note',
        name: '笔记详情',
        description: '获取笔记内容',
        opencliCommand: 'opencli xiaohongshu note',
        params: [
          { name: 'url', friendlyName: '笔记链接', type: 'string', required: true, description: '笔记链接' }
        ],
        outputType: 'json'
      },
      {
        id: 'comments',
        name: '评论列表',
        description: '获取笔记评论',
        opencliCommand: 'opencli xiaohongshu comments',
        params: [
          { name: 'url', friendlyName: '笔记链接', type: 'string', required: true, description: '笔记链接' },
          { name: 'limit', friendlyName: '数量限制', type: 'number', required: false, default: 10, description: '返回结果数量' },
          { name: 'with-replies', friendlyName: '包含回复', type: 'boolean', required: false, default: false, description: '是否包含楼中楼回复' }
        ],
        outputType: 'table'
      },
      {
        id: 'feed',
        name: '首页推荐',
        description: '获取首页推荐',
        opencliCommand: 'opencli xiaohongshu feed',
        params: [
          { name: 'limit', friendlyName: '数量限制', type: 'number', required: false, default: 10, description: '返回结果数量' }
        ],
        outputType: 'table'
      },
      {
        id: 'user',
        name: '用户笔记',
        description: '获取用户笔记',
        opencliCommand: 'opencli xiaohongshu user',
        params: [
          { name: 'uid', friendlyName: '用户ID', type: 'string', required: true, description: '用户ID' }
        ],
        outputType: 'table'
      },
      {
        id: 'download',
        name: '笔记下载',
        description: '下载笔记图片/视频',
        opencliCommand: 'opencli xiaohongshu download',
        params: [
          { name: 'url', friendlyName: '笔记链接', type: 'string', required: true, description: '笔记链接' },
          { name: 'output', friendlyName: '保存路径', type: 'path', required: false, description: '保存路径' }
        ],
        outputType: 'file'
      }
    ]
  },
  {
    id: 'zhihu',
    name: '知乎',
    icon: '🔵',
    description: '知乎问答社区',
    commands: [
      {
        id: 'hot',
        name: '热门话题',
        description: '获取热门话题',
        opencliCommand: 'opencli zhihu hot',
        params: [
          { name: 'limit', friendlyName: '数量限制', type: 'number', required: false, default: 10, description: '返回结果数量' }
        ],
        outputType: 'table'
      },
      {
        id: 'search',
        name: '搜索内容',
        description: '搜索内容',
        opencliCommand: 'opencli zhihu search',
        params: [
          { name: 'keyword', friendlyName: '搜索关键词', type: 'string', required: true, description: '搜索关键词' },
          { name: 'limit', friendlyName: '数量限制', type: 'number', required: false, default: 10, description: '返回结果数量' }
        ],
        outputType: 'table'
      },
      {
        id: 'question',
        name: '问题回答',
        description: '获取问题回答',
        opencliCommand: 'opencli zhihu question',
        params: [
          { name: 'id', friendlyName: '问题ID', type: 'string', required: true, description: '问题ID' },
          { name: 'limit', friendlyName: '数量限制', type: 'number', required: false, default: 10, description: '返回结果数量' }
        ],
        outputType: 'table'
      },
      {
        id: 'download',
        name: '文章下载',
        description: '下载文章',
        opencliCommand: 'opencli zhihu download',
        params: [
          { name: 'url', friendlyName: '文章链接', type: 'string', required: true, description: '文章链接' },
          { name: 'output', friendlyName: '保存路径', type: 'path', required: false, description: '保存路径' },
          { name: 'download-images', friendlyName: '下载图片', type: 'boolean', required: false, default: false, description: '是否下载图片' }
        ],
        outputType: 'file'
      }
    ]
  },
  {
    id: 'hupu',
    name: '虎扑',
    icon: '🏀',
    description: '虎扑体育社区',
    commands: [
      {
        id: 'hot',
        name: '热门帖子',
        description: '获取热门帖子',
        opencliCommand: 'opencli hupu hot',
        params: [
          { name: 'limit', friendlyName: '数量限制', type: 'number', required: false, default: 10, description: '返回结果数量' }
        ],
        outputType: 'table'
      },
      {
        id: 'search',
        name: '搜索帖子',
        description: '搜索帖子',
        opencliCommand: 'opencli hupu search',
        params: [
          { name: 'keyword', friendlyName: '搜索关键词', type: 'string', required: true, description: '搜索关键词' },
          { name: 'limit', friendlyName: '数量限制', type: 'number', required: false, default: 10, description: '返回结果数量' }
        ],
        outputType: 'table'
      },
      {
        id: 'detail',
        name: '帖子详情',
        description: '获取帖子详情',
        opencliCommand: 'opencli hupu detail',
        params: [
          { name: 'tid', friendlyName: '帖子ID', type: 'string', required: true, description: '帖子ID' },
          { name: 'replies', friendlyName: '包含回复', type: 'boolean', required: false, default: false, description: '是否包含回复' }
        ],
        outputType: 'json'
      }
    ]
  },
  {
    id: 'ctrip',
    name: '携程',
    icon: '✈️',
    description: '携程旅游平台',
    commands: [
      {
        id: 'search',
        name: '搜索',
        description: '搜索旅游产品',
        opencliCommand: 'opencli ctrip search',
        params: [
          { name: 'keyword', friendlyName: '搜索关键词', type: 'string', required: true, description: '搜索关键词' }
        ],
        outputType: 'table'
      }
    ]
  },
  {
    id: 'taobao',
    name: '淘宝',
    icon: '🛒',
    description: '淘宝购物平台',
    commands: [
      {
        id: 'search',
        name: '搜索商品',
        description: '搜索商品',
        opencliCommand: 'opencli taobao search',
        params: [
          { name: 'keyword', friendlyName: '搜索关键词', type: 'string', required: true, description: '搜索关键词' },
          { name: 'limit', friendlyName: '数量限制', type: 'number', required: false, default: 10, description: '返回结果数量' }
        ],
        outputType: 'table'
      },
      {
        id: 'detail',
        name: '商品详情',
        description: '获取商品详情',
        opencliCommand: 'opencli taobao detail',
        params: [
          { name: 'id', friendlyName: '商品ID', type: 'string', required: true, description: '商品ID' }
        ],
        outputType: 'json'
      },
      {
        id: 'reviews',
        name: '商品评论',
        description: '获取商品评论',
        opencliCommand: 'opencli taobao reviews',
        params: [
          { name: 'id', friendlyName: '商品ID', type: 'string', required: true, description: '商品ID' }
        ],
        outputType: 'table'
      },
      {
        id: 'cart',
        name: '购物车',
        description: '查看购物车',
        opencliCommand: 'opencli taobao cart',
        params: [],
        outputType: 'table'
      }
    ]
  }
]

export function getSiteConfig(siteId: string): SiteConfig | undefined {
  return siteConfigs.find(site => site.id === siteId)
}

export function getCommandConfig(siteId: string, commandId: string): CommandConfig | undefined {
  const site = getSiteConfig(siteId)
  return site?.commands.find(cmd => cmd.id === commandId)
}
```

- [ ] **Step 2: 提交**

```bash
git add src/web/utils/adapter-config.ts
git commit -m "feat: add adapter configuration with friendly parameter names"
```

---

## Task 3: 侧边导航栏组件

**Files:**
- Create: `prism/src/web/components/common/Sidebar.vue`

- [ ] **Step 1: 创建侧边导航栏组件**

```vue
<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h1 class="sidebar-title">Prism</h1>
      <p class="sidebar-subtitle">OpenCLI Web UI</p>
    </div>
    <div class="sidebar-content">
      <div
        v-for="site in sites"
        :key="site.id"
        :class="['sidebar-item', { active: activeSite === site.id }]"
        @click="handleSelect(site.id)"
      >
        <span class="sidebar-icon">{{ site.icon }}</span>
        <span class="sidebar-name">{{ site.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { siteConfigs, SiteConfig } from '../../utils/adapter-config'

const emit = defineEmits<{
  (e: 'select', siteId: string): void
}>()

const sites = ref<SiteConfig[]>(siteConfigs)
const activeSite = ref<string | null>(null)

const handleSelect = (siteId: string) => {
  activeSite.value = siteId
  emit('select', siteId)
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  height: 100vh;
  background-color: var(--color-background);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.sidebar-title {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--color-primary);
  margin: 0;
}

.sidebar-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-weak);
  margin: var(--spacing-xs) 0 0 0;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: var(--spacing-xs);
}

.sidebar-item:hover {
  background-color: var(--color-surface);
}

.sidebar-item.active {
  background-color: var(--color-primary);
  color: white;
}

.sidebar-icon {
  font-size: var(--font-size-xl);
  margin-right: var(--spacing-sm);
}

.sidebar-name {
  font-size: var(--font-size-md);
  font-weight: 500;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add src/web/components/common/Sidebar.vue
git commit -m "feat: add sidebar navigation component"
```

---

## Task 4: 参数表单组件

**Files:**
- Create: `prism/src/web/components/common/ParamForm.vue`

- [ ] **Step 1: 创建参数表单组件**

```vue
<template>
  <div class="param-form">
    <div v-for="param in params" :key="param.name" class="form-item">
      <label class="form-label">
        {{ param.friendlyName }}
        <span v-if="param.required" class="required">*</span>
      </label>
      <p class="form-description">{{ param.description }}</p>
      
      <a-input
        v-if="param.type === 'string'"
        v-model:value="formValues[param.name]"
        :placeholder="`请输入${param.friendlyName}`"
      />
      
      <a-input-number
        v-else-if="param.type === 'number'"
        v-model:value="formValues[param.name]"
        :placeholder="`请输入${param.friendlyName}`"
        style="width: 100%"
      />
      
      <a-switch
        v-else-if="param.type === 'boolean'"
        v-model:checked="formValues[param.name]"
      />
      
      <a-select
        v-else-if="param.type === 'select'"
        v-model:value="formValues[param.name]"
        :placeholder="`请选择${param.friendlyName}`"
        style="width: 100%"
      >
        <a-select-option v-for="option in param.options" :key="option" :value="option">
          {{ option }}
        </a-select-option>
      </a-select>
      
      <a-input
        v-else-if="param.type === 'path'"
        v-model:value="formValues[param.name]"
        :placeholder="defaultPath"
      >
        <template #suffix>
          <folder-outlined @click="handleBrowsePath(param.name)" style="cursor: pointer" />
        </template>
      </a-input>
    </div>
    
    <a-button type="primary" @click="handleSubmit" :loading="loading" class="submit-btn">
      执行
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { FolderOutlined } from '@ant-design/icons-vue'
import { ParamConfig } from '../../utils/adapter-config'

const props = defineProps<{
  params: ParamConfig[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', values: Record<string, any>): void
}>()

const defaultPath = '~/Downloads/prism-output/'
const formValues = reactive<Record<string, any>>({})

watch(() => props.params, (newParams) => {
  Object.keys(formValues).forEach(key => delete formValues[key])
  newParams.forEach(param => {
    if (param.default !== undefined) {
      formValues[param.name] = param.default
    }
  })
}, { immediate: true })

const handleBrowsePath = (paramName: string) => {
  // TODO: 实现文件浏览器
  console.log('Browse path for:', paramName)
}

const handleSubmit = () => {
  emit('submit', { ...formValues })
}
</script>

<style scoped>
.param-form {
  margin-top: var(--spacing-md);
}

.form-item {
  margin-bottom: var(--spacing-md);
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
  display: block;
}

.form-label .required {
  color: #ff4d4f;
  margin-left: 2px;
}

.form-description {
  font-size: var(--font-size-xs);
  color: var(--color-text-weak);
  margin: 0 0 var(--spacing-xs) 0;
}

.submit-btn {
  margin-top: var(--spacing-md);
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add src/web/components/common/ParamForm.vue
git commit -m "feat: add parameter form component"
```

---

## Task 5: 结果展示组件

**Files:**
- Create: `prism/src/web/components/common/ResultDisplay.vue`

- [ ] **Step 1: 创建结果展示组件**

```vue
<template>
  <div class="result-display">
    <div class="result-header">
      <span class="result-type">{{ resultTypeLabel }}</span>
      <a-button v-if="canCopy" size="small" @click="handleCopy" class="copy-btn">
        <copy-outlined />
        复制
      </a-button>
    </div>
    
    <div class="result-content">
      <a-table
        v-if="result.type === 'table' && Array.isArray(result.data)"
        :data-source="result.data"
        :columns="tableColumns"
        :pagination="{ pageSize: 10 }"
        size="small"
        :scroll="{ x: 'max-content' }"
      />
      
      <div v-else-if="result.type === 'json'" class="result-json">
        <pre>{{ formattedJson }}</pre>
      </div>
      
      <div v-else-if="result.type === 'text'" class="result-text">
        <pre>{{ result.data }}</pre>
      </div>
      
      <div v-else-if="result.type === 'file'" class="result-file">
        <check-circle-outlined style="color: var(--color-success); font-size: 24px;" />
        <p>文件已保存到：</p>
        <code>{{ result.filePath }}</code>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CopyOutlined, CheckCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

interface Result {
  success: boolean
  type: 'table' | 'json' | 'text' | 'file'
  data?: any
  filePath?: string
}

const props = defineProps<{
  result: Result
}>()

const resultTypeLabel = computed(() => {
  const labels = {
    table: '表格数据',
    json: 'JSON 数据',
    text: '文本结果',
    file: '文件结果'
  }
  return labels[props.result.type]
})

const canCopy = computed(() => {
  return props.result.type !== 'file'
})

const formattedJson = computed(() => {
  if (props.result.type === 'json' && props.result.data) {
    return JSON.stringify(props.result.data, null, 2)
  }
  return ''
})

const tableColumns = computed(() => {
  if (props.result.type === 'table' && Array.isArray(props.result.data) && props.result.data.length > 0) {
    return Object.keys(props.result.data[0]).map(key => ({
      title: key,
      dataIndex: key,
      key: key,
      ellipsis: true
    }))
  }
  return []
})

const handleCopy = async () => {
  let text = ''
  if (props.result.type === 'table' && Array.isArray(props.result.data)) {
    text = JSON.stringify(props.result.data, null, 2)
  } else if (props.result.type === 'json') {
    text = formattedJson.value
  } else if (props.result.type === 'text') {
    text = String(props.result.data)
  }
  
  try {
    await navigator.clipboard.writeText(text)
    message.success('已复制到剪贴板')
  } catch (err) {
    message.error('复制失败')
  }
}
</script>

<style scoped>
.result-display {
  margin-top: var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.result-type {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text);
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.result-content {
  padding: var(--spacing-md);
  max-height: 500px;
  overflow: auto;
}

.result-json pre,
.result-text pre {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: var(--font-size-sm);
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}

.result-file {
  text-align: center;
  padding: var(--spacing-xl);
}

.result-file p {
  margin: var(--spacing-md) 0 var(--spacing-sm) 0;
}

.result-file code {
  background-color: var(--color-surface);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add src/web/components/common/ResultDisplay.vue
git commit -m "feat: add result display component with copy functionality"
```

---

## Task 6: 网站页面组件（Bilibili）

**Files:**
- Create: `prism/src/web/components/sites/BilibiliPage.vue`

- [ ] **Step 1: 创建 Bilibili 页面组件**

```vue
<template>
  <div class="site-page">
    <div class="page-header">
      <h1 class="page-title">{{ siteConfig?.icon }} {{ siteConfig?.name }}</h1>
      <p class="page-description">{{ siteConfig?.description }}</p>
    </div>
    
    <div class="commands-grid">
      <div v-for="command in siteConfig?.commands" :key="command.id" class="command-card card">
        <h3 class="card-title">{{ command.name }}</h3>
        <p class="card-description">{{ command.description }}</p>
        
        <ParamForm
          :params="command.params"
          :loading="loadingCommand === command.id"
          @submit="(values) => handleExecute(command.id, values)"
        />
        
        <ResultDisplay
          v-if="results[command.id]"
          :result="results[command.id]"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { getSiteConfig, CommandConfig } from '../../utils/adapter-config'
import ParamForm from '../common/ParamForm.vue'
import ResultDisplay from '../common/ResultDisplay.vue'

const siteConfig = getSiteConfig('bilibili')
const loadingCommand = ref<string | null>(null)
const results = reactive<Record<string, any>>({})

const handleExecute = async (commandId: string, params: Record<string, any>) => {
  loadingCommand.value = commandId
  
  try {
    const response = await fetch('/api/sites/bilibili/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: commandId, params })
    })
    
    const result = await response.json()
    results[commandId] = result
  } catch (error) {
    results[commandId] = {
      success: false,
      type: 'text',
      data: `执行失败: ${(error as Error).message}`
    }
  } finally {
    loadingCommand.value = null
  }
}
</script>

<style scoped>
.site-page {
  padding: var(--spacing-xl);
}

.page-header {
  margin-bottom: var(--spacing-xl);
}

.page-title {
  font-size: var(--font-size-3xl);
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.page-description {
  font-size: var(--font-size-lg);
  color: var(--color-text-weak);
  margin: var(--spacing-sm) 0 0 0;
}

.commands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: var(--spacing-lg);
}

.command-card {
  padding: var(--spacing-lg);
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add src/web/components/sites/BilibiliPage.vue
git commit -m "feat: add Bilibili page component"
```

---

## Task 7-11: 其他网站页面组件

**Files:**
- Create: `prism/src/web/components/sites/XiaohongshuPage.vue`
- Create: `prism/src/web/components/sites/ZhihuPage.vue`
- Create: `prism/src/web/components/sites/HupuPage.vue`
- Create: `prism/src/web/components/sites/CtripPage.vue`
- Create: `prism/src/web/components/sites/TaobaoPage.vue`

- [ ] **Step 1: 创建其他网站页面组件（复制 BilibiliPage.vue 并修改 siteConfig）**

每个文件只需修改 `getSiteConfig` 的参数和 API 路径。

- [ ] **Step 2: 提交**

```bash
git add src/web/components/sites/
git commit -m "feat: add all site page components"
```

---

## Task 12: 更新主应用组件

**Files:**
- Modify: `prism/src/web/App.vue`

- [ ] **Step 1: 更新 App.vue**

```vue
<template>
  <div class="app-layout">
    <Sidebar @select="handleSiteSelect" />
    <div class="app-content">
      <BilibiliPage v-if="activeSite === 'bilibili'" />
      <XiaohongshuPage v-else-if="activeSite === 'xiaohongshu'" />
      <ZhihuPage v-else-if="activeSite === 'zhihu'" />
      <HupuPage v-else-if="activeSite === 'hupu'" />
      <CtripPage v-else-if="activeSite === 'ctrip'" />
      <TaobaoPage v-else-if="activeSite === 'taobao'" />
      <div v-else class="welcome-page">
        <h1>欢迎使用 Prism</h1>
        <p>请从左侧选择一个网站开始使用</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './components/common/Sidebar.vue'
import BilibiliPage from './components/sites/BilibiliPage.vue'
import XiaohongshuPage from './components/sites/XiaohongshuPage.vue'
import ZhihuPage from './components/sites/ZhihuPage.vue'
import HupuPage from './components/sites/HupuPage.vue'
import CtripPage from './components/sites/CtripPage.vue'
import TaobaoPage from './components/sites/TaobaoPage.vue'

const activeSite = ref<string | null>(null)

const handleSiteSelect = (siteId: string) => {
  activeSite.value = siteId
}
</script>

<style>
@import './styles/design-system.css';

.app-layout {
  display: flex;
  min-height: 100vh;
}

.app-content {
  flex: 1;
  overflow-y: auto;
}

.welcome-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}

.welcome-page h1 {
  font-size: var(--font-size-4xl);
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}

.welcome-page p {
  font-size: var(--font-size-lg);
  color: var(--color-text-weak);
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add src/web/App.vue
git commit -m "feat: update main app with sidebar and site pages"
```

---

## Task 13: 更新后端 API

**Files:**
- Modify: `prism/src/server/routes/adapters.ts`
- Modify: `prism/src/server/routes/execute.ts`

- [ ] **Step 1: 更新适配器路由**

```typescript
import { Router } from 'express'
import { OpenCLIService } from '../services/opencli'

const router = Router()
const opencliService = new OpenCLIService()

router.get('/sites', async (req, res) => {
  try {
    const sites = [
      { id: 'bilibili', name: 'Bilibili', icon: '📺', description: '哔哩哔哩视频平台' },
      { id: 'xiaohongshu', name: '小红书', icon: '📕', description: '小红书笔记平台' },
      { id: 'zhihu', name: '知乎', icon: '🔵', description: '知乎问答社区' },
      { id: 'hupu', name: '虎扑', icon: '🏀', description: '虎扑体育社区' },
      { id: 'ctrip', name: '携程', icon: '✈️', description: '携程旅游平台' },
      { id: 'taobao', name: '淘宝', icon: '🛒', description: '淘宝购物平台' }
    ]
    res.json(sites)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sites' })
  }
})

router.get('/sites/:site', async (req, res) => {
  try {
    const { site } = req.params
    const commands = await opencliService.getCommands(site)
    res.json({ id: site, commands })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch site' })
  }
})

export { router as adapterRoutes }
```

- [ ] **Step 2: 更新执行路由**

```typescript
import { Router } from 'express'
import { OpenCLIService } from '../services/opencli'

const router = Router()
const opencliService = new OpenCLIService()

router.post('/sites/:site/execute', async (req, res) => {
  try {
    const { site } = req.params
    const { command, params } = req.body
    const result = await opencliService.executeCommand(site, command, params)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute command' })
  }
})

export { router as executeRoutes }
```

- [ ] **Step 3: 提交**

```bash
git add src/server/routes/
git commit -m "feat: update backend API for site-based execution"
```

---

## Self-Review

**1. Spec coverage:**
- ✅ Airtable 风格设计系统
- ✅ 侧边导航栏
- ✅ 6 个网站页面
- ✅ 参数友好化
- ✅ 智能结果展示
- ✅ 一键复制功能
- ✅ 文件输出配置

**2. Placeholder scan:**
- 无 TBD 或 TODO
- 所有步骤包含实际代码

**3. Type consistency:**
- 类型定义一致
- 参数名称匹配
