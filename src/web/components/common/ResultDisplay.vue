<template>
  <div class="result-display">
    <!-- 结果头部：标题和复制按钮 -->
    <div class="result-header">
      <div class="result-title">
        <CheckCircleFilled v-if="result.success" class="result-icon success" />
        <CloseCircleFilled v-else class="result-icon error" />
        <span>{{ result.success ? '执行成功' : '执行失败' }}</span>
        <span v-if="dataCount > 0" class="data-count">共 {{ dataCount }} 条</span>
      </div>
      <div class="header-actions">
        <a-button
          v-if="displayType === 'table'"
          type="text"
          size="small"
          class="action-button"
          @click="toggleTableView"
        >
          <TableOutlined v-if="!tableViewMode" />
          <UnorderedListOutlined v-else />
          <span class="action-text">{{ tableViewMode ? '表格' : '列表' }}</span>
        </a-button>
        <a-button
          v-if="showCopyButton"
          type="text"
          size="small"
          class="action-button copy-button"
          @click="handleCopy"
        >
          <CopyOutlined />
          <span class="action-text">复制</span>
        </a-button>
      </div>
    </div>

    <!-- 结果内容区域 -->
    <div class="result-content">
      <!-- 错误信息 -->
      <div v-if="!result.success" class="result-error">
        <pre class="error-text">{{ result.error }}</pre>
      </div>

      <!-- 文件类型结果 -->
      <div v-else-if="displayType === 'file'" class="result-file">
        <div class="file-info">
          <FileOutlined class="file-icon" />
          <span class="file-path">{{ result.filePath }}</span>
        </div>
        <div class="file-status">
          <CheckCircleFilled class="success-icon" />
          <span>文件已保存</span>
        </div>
      </div>

      <!-- 表格类型结果 -->
      <div v-else-if="displayType === 'table'" class="result-table-wrapper">
        <!-- 表格视图 -->
        <div v-if="!tableViewMode" class="result-table">
          <a-table
            :columns="computedTableColumns"
            :data-source="tableData"
            :pagination="tablePagination"
            :scroll="{ x: 'max-content', y: 400 }"
            size="small"
            bordered
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column && column.key === '_actions'">
                <div class="row-actions">
                  <!-- 小红书操作 -->
                  <template v-if="actionType === 'xiaohongshu'">
                    <a-button type="link" size="small" @click="handleXiaohongshuAction('detail', record)">详情</a-button>
                    <a-button type="link" size="small" @click="handleXiaohongshuAction('download', record)">下载</a-button>
                    <a-button type="link" size="small" @click="handleXiaohongshuAction('comments', record)">评论</a-button>
                  </template>
                  <!-- 淘宝操作 -->
                  <template v-else-if="actionType === 'taobao'">
                    <a-button type="link" size="small" @click="handleTaobaoAction('detail', record)">详情</a-button>
                    <a-button type="link" size="small" @click="handleTaobaoAction('reviews', record)">评价</a-button>
                    <a-button type="link" size="small" @click="handleTaobaoAction('add-cart', record)">加购</a-button>
                  </template>
                  <!-- Bilibili 操作 -->
                  <template v-else-if="actionType === 'bilibili'">
                    <a-button type="link" size="small" @click="handleBilibiliAction('detail', record)">详情</a-button>
                    <a-button type="link" size="small" @click="handleBilibiliAction('comments', record)">评论</a-button>
                    <a-button type="link" size="small" @click="handleBilibiliAction('download', record)">下载</a-button>
                  </template>
                </div>
              </template>
              <template v-else-if="column && column.key === 'url'">
                <a-tooltip v-if="record.url" :title="record.url">
                  <span class="url-cell">{{ truncateUrl(record.url) }}</span>
                </a-tooltip>
              </template>
              <template v-else-if="column && column.key === 'bvid'">
                <span class="bvid-cell">{{ record.bvid || '-' }}</span>
              </template>
            </template>
          </a-table>
        </div>
        <!-- 列表视图 -->
        <div v-else class="result-list">
            <div v-for="(item, index) in paginatedListData" :key="index" class="list-item">
             <div v-for="col in tableColumns" :key="col.key" class="list-row">
               <span class="list-label">{{ col.title }}:</span>
               <span class="list-value">{{ formatCellValue((item as Record<string, unknown>)[String(col.dataIndex)]) }}</span>
             </div>
            <div v-if="showActions && hasActionableData" class="list-actions">
              <!-- 小红书操作 -->
              <template v-if="actionType === 'xiaohongshu'">
                <a-button type="link" size="small" @click="handleXiaohongshuAction('detail', item)">详情</a-button>
                <a-button type="link" size="small" @click="handleXiaohongshuAction('download', item)">下载</a-button>
                <a-button type="link" size="small" @click="handleXiaohongshuAction('comments', item)">评论</a-button>
              </template>
              <!-- 淘宝操作 -->
              <template v-else-if="actionType === 'taobao'">
                <a-button type="link" size="small" @click="handleTaobaoAction('detail', item)">详情</a-button>
                <a-button type="link" size="small" @click="handleTaobaoAction('reviews', item)">评价</a-button>
                <a-button type="link" size="small" @click="handleTaobaoAction('add-cart', item)">加购</a-button>
              </template>
              <!-- Bilibili 操作 -->
              <template v-else-if="actionType === 'bilibili'">
                <a-button type="link" size="small" @click="handleBilibiliAction('detail', item)">详情</a-button>
                <a-button type="link" size="small" @click="handleBilibiliAction('comments', item)">评论</a-button>
                <a-button type="link" size="small" @click="handleBilibiliAction('download', item)">下载</a-button>
              </template>
            </div>
            </div>
         </div>
      </div>

      <!-- JSON 类型结果 -->
      <div v-else-if="displayType === 'json'" class="result-json">
        <div class="json-header">
          <a-button type="text" size="small" @click="toggleJsonCollapse">
            <DownOutlined :class="{ collapsed: jsonCollapsed }" />
            <span>{{ jsonCollapsed ? '展开' : '收起' }} JSON</span>
          </a-button>
        </div>
        <div v-show="!jsonCollapsed" class="json-content">
          <pre class="json-text"><code v-html="highlightedJson"></code></pre>
        </div>
      </div>

      <!-- 文本类型结果 -->
      <div v-else-if="displayType === 'text'" class="result-text">
        <pre class="text-content">{{ result.data }}</pre>
      </div>

      <!-- 空结果 -->
      <div v-else class="result-empty">
        <span>无返回数据</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  CheckCircleFilled,
  CloseCircleFilled,
  CopyOutlined,
  FileOutlined,
  DownOutlined,
  TableOutlined,
  UnorderedListOutlined
} from '@ant-design/icons-vue'
import type { TableColumnType, TableProps } from 'ant-design-vue'

/**
 * 执行结果接口
 */
export interface ExecutionResult {
  /** 是否成功 */
  success: boolean
  /** 返回数据（可以是字符串、对象、数组） */
  data?: string | Record<string, unknown> | unknown[]
  /** 错误信息 */
  error?: string
  /** 文件路径（文件类型结果） */
  filePath?: string
  /** 输出类型提示（支持 type 和 outputType 两种字段名） */
  type?: 'text' | 'json' | 'table' | 'file'
  outputType?: 'text' | 'json' | 'table' | 'file'
}

const emit = defineEmits<{
  (e: 'action', event: { action: string; url?: string; itemId?: string; bvid?: string }): void
}>()

// 定义 Props
const props = defineProps<{
  /** 执行结果 */
  result: ExecutionResult
  /** 是否显示操作按钮 */
  showActions?: boolean
  /** 操作类型：xiaohongshu | taobao | bilibili */
  actionType?: 'xiaohongshu' | 'taobao' | 'bilibili'
}>()

// JSON 折叠状态
const jsonCollapsed = ref(false)
// 表格视图模式：false=表格, true=列表
const tableViewMode = ref(false)
// 列表视图分页
const listCurrentPage = ref(1)
const listPageSize = 10

/**
 * 数据总数
 */
const dataCount = computed(() => {
  const data = props.result.data
  if (Array.isArray(data)) return data.length
  return 0
})

/**
 * 检测结果类型
 */
const displayType = computed((): 'table' | 'json' | 'text' | 'file' | 'empty' => {
  if (!props.result.success) {
    return 'text'
  }

  if (props.result.filePath) {
    return 'file'
  }

  const data = props.result.data

  if (data === undefined || data === null) {
    return 'empty'
  }

  // 单个对象直接显示为表格（field/value 形式）
  if (typeof data === 'object' && !Array.isArray(data)) {
    return 'table'
  }

  // 数组中的对象也显示为表格
  if (Array.isArray(data) && data.length > 0) {
    const firstItem = data[0]
    if (typeof firstItem === 'object' && firstItem !== null) {
      return 'table'
    }
    return 'json'
  }

  // 字符串尝试解析
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data)
      // 单个对象显示为表格
      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        return 'table'
      }
      // 数组中的对象也显示为表格
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
        return 'table'
      }
      return 'json'
    } catch {
      return 'text'
    }
  }

  return 'text'
})

/**
 * 是否显示复制按钮
 */
const showCopyButton = computed(() => {
  return displayType.value !== 'file' && displayType.value !== 'empty'
})

/**
 * 表格列配置
 */
const tableColumns = computed((): TableColumnType[] => {
  const data = tableData.value
  if (!Array.isArray(data) || data.length === 0) {
    return []
  }

  const firstItem = data[0]
  if (typeof firstItem !== 'object' || firstItem === null) {
    return []
  }

  // 从第一个对象的键生成列（排除 _key）
  return Object.keys(firstItem)
    .filter(key => key !== '_key')
    .map(key => ({
      title: formatColumnName(key),
      dataIndex: key,
      key: key,
      ellipsis: true,
      width: getColumnWidth(key)
    }))
})

/**
 * 是否有 url 字段
 */
const hasUrlField = computed(() => {
  const data = tableData.value
  if (!Array.isArray(data) || data.length === 0) return false
  const firstItem = data[0]
  if (typeof firstItem !== 'object' || firstItem === null) return false
  return 'url' in firstItem
})

/**
 * URL 是否包含 xsec_token（只有包含签名的 URL 才能操作）
 */
const hasSignedUrl = computed(() => {
  const data = tableData.value
  if (!Array.isArray(data) || data.length === 0) return false
  const firstItem = data[0]
  if (typeof firstItem !== 'object' || firstItem === null) return false
  const url = (firstItem as Record<string, unknown>).url as string
  if (!url) return false
  return url.includes('xsec_token')
})

/**
 * 是否有 item_id 字段（淘宝）
 */
const hasItemId = computed(() => {
  const data = tableData.value
  if (!Array.isArray(data) || data.length === 0) return false
  const firstItem = data[0]
  if (typeof firstItem !== 'object' || firstItem === null) return false
  return 'item_id' in firstItem
})

/**
 * 是否有可操作的 BV 号（Bilibili）
 */
const hasBvid = computed(() => {
  const data = tableData.value
  if (!Array.isArray(data) || data.length === 0) return false
  const firstItem = data[0]
  if (typeof firstItem !== 'object' || firstItem === null) return false
  const record = firstItem as Record<string, unknown>
  const url = record.url as string
  if (url && url.includes('/BV')) return true
  return 'bvid' in firstItem
})

/**
 * 是否有可操作的数据
 */
const hasActionableData = computed(() => {
  if (props.actionType === 'xiaohongshu') return hasUrlField.value && hasSignedUrl.value
  if (props.actionType === 'taobao') return hasItemId.value
  if (props.actionType === 'bilibili') return hasBvid.value
  return false
})

/**
 * 带操作列的表格配置
 */
const computedTableColumns = computed((): TableColumnType[] => {
  const cols = [...tableColumns.value]
  if (props.showActions && hasActionableData.value) {
    cols.push({
      title: '操作',
      key: '_actions',
      width: 180,
      fixed: 'right'
    })
  }
  return cols
})

/**
 * 表格数据
 */
const tableData = computed(() => {
  const data = props.result.data
  
  // 如果是单个对象，转换为键值对数组
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    return Object.entries(data).map(([key, value], index) => ({
      _key: index,
      field: key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value)
    }))
  }
  
  if (!Array.isArray(data)) {
    return []
  }

  // 添加 key 属性
  return data.map((item, index) => {
    if (typeof item === 'object' && item !== null) {
      return {
        ...item,
        _key: index
      }
    }
    return { _key: index, value: item }
  })
})

/**
 * 列表视图数据 - 显示所有数据，不分页
 */
const paginatedListData = computed(() => {
  return tableData.value
})

/**
 * 表格分页配置 - 不分页，显示所有数据
 */
const tablePagination = false

/**
 * JSON 语法高亮
 */
const highlightedJson = computed(() => {
  const data = props.result.data
  let jsonStr: string

  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data)
      jsonStr = JSON.stringify(parsed, null, 2)
    } catch {
      jsonStr = data
    }
  } else {
    jsonStr = JSON.stringify(data, null, 2)
  }

  return syntaxHighlight(jsonStr)
})

/**
 * JSON 语法高亮处理
 */
function syntaxHighlight(json: string): string {
  // 转义 HTML
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // 高亮处理
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'json-number'
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key'
        } else {
          cls = 'json-string'
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean'
      } else if (/null/.test(match)) {
        cls = 'json-null'
      }
      return `<span class="${cls}">${match}</span>`
    }
  )
}

/**
 * 格式化列名 - 使用中文映射
 */
function formatColumnName(key: string): string {
  const columnNameMap: Record<string, string> = {
    field: '字段',
    value: '值',
    rank: '排名',
    title: '标题',
    author: '作者',
    name: '名称',
    score: '评分',
    play: '播放量',
    danmaku: '弹幕数',
    likes: '点赞数',
    collects: '收藏数',
    comments: '评论数',
    views: '观看数',
    url: '链接',
    bvid: 'BV号',
    text: '内容',
    time: '时间',
    date: '日期',
    status: '状态',
    size: '大小',
    index: '序号',
    from: '开始时间',
    to: '结束时间',
    content: '内容',
    mid: '用户ID',
    sign: '签名',
    following: '关注数',
    fans: '粉丝数',
    progress: '进度',
    plays: '播放量',
    published_at: '发布时间',
    type: '类型',
    id: 'ID',
    item_id: '商品ID',
    price: '价格',
    sales: '销量',
    shop: '店铺',
    location: '地区',
    user: '用户',
    action: '操作',
    note: '笔记',
    replies: '回复数',
    is_reply: '是否回复',
    reply_to: '回复对象',
    metric: '指标',
    total: '总计',
    trend: '趋势',
    section: '分类',
    extra: '备注',
    uid: '用户ID',
    level: '等级',
    coins: '硬币',
    followers: '粉丝',
    fid: '收藏夹ID',
    lang: '语言',
    period: '周期',
    query: '关键词',
    limit: '数量限制',
    page: '页码',
    order: '排序',
    pages: '页数'
  }
  
  if (columnNameMap[key]) {
    return columnNameMap[key]
  }
  
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim()
}

/**
 * 获取列宽度
 */
function getColumnWidth(key: string): number | undefined {
  const widthMap: Record<string, number> = {
    rank: 60,
    id: 80,
    url: 200,
    title: 250,
    author: 120,
    name: 120,
    status: 80,
    time: 100,
    date: 100,
    likes: 80,
    collects: 80,
    comments: 80,
    views: 80,
    plays: 80,
    danmaku: 80,
    score: 80,
    price: 100,
    sales: 80,
    shop: 120,
    location: 80,
    item_id: 100,
    text: 300,
    content: 300,
    replies: 80,
    following: 80,
    fans: 80,
    progress: 80,
    field: 100,
    value: 200,
    mid: 100,
    sign: 150,
    bvid: 120,
    index: 60,
    from: 80,
    to: 80,
    metric: 100,
    total: 100,
    trend: 100,
    section: 80,
    extra: 100,
    uid: 100,
    level: 60,
    coins: 80,
    followers: 80,
    fid: 100,
    type: 80,
    user: 100,
    action: 80,
    note: 100,
    is_reply: 80,
    reply_to: 100,
    published_at: 100
  }
  return widthMap[key.toLowerCase()]
}

/**
 * 截断 URL 显示
 */
function truncateUrl(url: string): string {
  if (!url) return '-'
  if (url.length <= 40) return url
  return url.substring(0, 40) + '...'
}

/**
 * 从 URL 中提取 BV 号
 */
function extractBvid(url: string): string | null {
  if (!url) return null
  const match = url.match(/\/(BV[a-zA-Z0-9]+)/)
  return match ? match[1] : null
}

/**
 * 格式化单元格值
 */
function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

/**
 * 小红书操作处理
 */
function handleXiaohongshuAction(action: string, record: Record<string, unknown>) {
  const url = record.url as string
  if (!url) {
    message.warning('该记录没有URL')
    return
  }
  emit('action', { action, url })
}

/**
 * 淘宝操作处理
 */
function handleTaobaoAction(action: string, record: Record<string, unknown>) {
  const itemId = record.item_id as string
  if (!itemId) {
    message.warning('该记录没有商品ID')
    return
  }
  emit('action', { action, itemId })
}

/**
 * Bilibili 操作处理
 */
function handleBilibiliAction(action: string, record: Record<string, unknown>) {
  const url = record.url as string
  const bvid = extractBvid(url) || (record.bvid as string)
  if (!bvid) {
    message.warning('该记录没有BV号')
    return
  }
  emit('action', { action, bvid })
}

/**
 * 切换表格/列表视图
 */
function toggleTableView() {
  tableViewMode.value = !tableViewMode.value
  listCurrentPage.value = 1
}

/**
 * 切换 JSON 折叠状态
 */
function toggleJsonCollapse() {
  jsonCollapsed.value = !jsonCollapsed.value
}

/**
 * 处理复制操作
 */
async function handleCopy() {
  const data = props.result.data
  let textToCopy: string

  if (typeof data === 'string') {
    textToCopy = data
  } else {
    textToCopy = JSON.stringify(data, null, 2)
  }

  try {
    await navigator.clipboard.writeText(textToCopy)
    message.success('已复制到剪贴板')
  } catch {
    // 降级方案：使用传统复制方法
    const textarea = document.createElement('textarea')
    textarea.value = textToCopy
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      message.success('已复制到剪贴板')
    } catch {
      message.error('复制失败')
    }
    document.body.removeChild(textarea)
  }
}

// 当结果变化时重置状态
watch(
  () => props.result,
  () => {
    jsonCollapsed.value = false
    tableViewMode.value = false
    listCurrentPage.value = 1
  }
)
</script>

<style scoped>
.result-display {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 结果头部 */
.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.result-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text);
}

.result-icon {
  font-size: 16px;
}

.result-icon.success {
  color: var(--color-success);
}

.result-icon.error {
  color: #ff4d4f;
}

.data-count {
  font-weight: 400;
  color: var(--color-text-weak);
  font-size: var(--font-size-xs);
  margin-left: var(--spacing-xs);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.action-button {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-weak);
  font-size: var(--font-size-xs);
  padding: 4px 8px;
}

.action-button:hover {
  color: var(--color-primary);
}

.action-text {
  margin-left: 2px;
}

/* 结果内容区域 */
.result-content {
  padding: var(--spacing-md);
  overflow: auto;
}

/* 错误信息 */
.result-error {
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
}

.error-text {
  margin: 0;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: var(--font-size-sm);
  color: #cf1322;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 文件类型结果 */
.result-file {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.file-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.file-icon {
  font-size: 20px;
  color: var(--color-primary);
}

.file-path {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: var(--font-size-sm);
  color: var(--color-text);
  word-break: break-all;
}

.file-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--color-success);
}

.success-icon {
  color: var(--color-success);
}

/* 表格类型结果 */
.result-table-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.result-table {
  overflow: auto;
  flex: 1;
}

.row-actions {
  display: flex;
  gap: 4px;
  flex-wrap: nowrap;
}

.row-actions :deep(.ant-btn-link) {
  padding: 0 4px;
  font-size: 12px;
}

.url-cell {
  color: var(--color-primary);
  font-size: 12px;
  cursor: pointer;
}

/* 列表视图 */
.result-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.list-item {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
}

.list-row {
  display: flex;
  align-items: flex-start;
  padding: 4px 0;
  font-size: var(--font-size-sm);
}

.list-label {
  flex-shrink: 0;
  width: 100px;
  font-weight: 500;
  color: var(--color-text-weak);
}

.list-value {
  flex: 1;
  color: var(--color-text);
  word-break: break-all;
}

.list-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}

.list-pagination {
  display: flex;
  justify-content: center;
  padding: var(--spacing-md) 0;
}

/* JSON 类型结果 */
.result-json {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.json-header {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.json-header :deep(.ant-btn) {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--color-text-weak);
}

.json-header :deep(.ant-btn:hover) {
  color: var(--color-primary);
}

.json-header :deep(.anticon) {
  transition: transform 0.2s;
}

.json-header :deep(.anticon.collapsed) {
  transform: rotate(-90deg);
}

.json-content {
  padding: var(--spacing-md);
  max-height: 400px;
  overflow: auto;
}

.json-text {
  margin: 0;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: var(--font-size-sm);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

/* JSON 语法高亮颜色 */
.json-text :deep(.json-key) {
  color: #881391;
}

.json-text :deep(.json-string) {
  color: #1a1aa6;
}

.json-text :deep(.json-number) {
  color: #1c00cf;
}

.json-text :deep(.json-boolean) {
  color: #0d22aa;
}

.json-text :deep(.json-null) {
  color: #808080;
}

/* 文本类型结果 */
.result-text {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  max-height: 400px;
  overflow: auto;
}

.text-content {
  margin: 0;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: var(--font-size-sm);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--color-text);
}

/* 空结果 */
.result-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--color-text-weak);
  font-size: var(--font-size-sm);
}

/* Ant Design 表格样式覆盖 */
:deep(.ant-table) {
  font-size: var(--font-size-sm);
}

:deep(.ant-table-wrapper) {
  overflow: auto;
}

:deep(.ant-table-thead > tr > th) {
  background-color: var(--color-surface);
  font-weight: 500;
  position: sticky;
  top: 0;
  z-index: 1;
}

:deep(.ant-table-tbody > tr > td) {
  max-width: 300px;
}

:deep(.ant-pagination) {
  margin: var(--spacing-md) 0 0 0;
}
</style>
