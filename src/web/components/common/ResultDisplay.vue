<template>
  <div class="result-display">
    <!-- 结果头部：标题和复制按钮 -->
    <div class="result-header">
      <div class="result-title">
        <CheckCircleFilled v-if="result.success" class="result-icon success" />
        <CloseCircleFilled v-else class="result-icon error" />
        <span>{{ result.success ? '执行成功' : '执行失败' }}</span>
      </div>
      <a-button
        v-if="showCopyButton"
        type="text"
        size="small"
        class="copy-button"
        @click="handleCopy"
      >
        <CopyOutlined />
        <span class="copy-text">复制</span>
      </a-button>
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
      <div v-else-if="displayType === 'table'" class="result-table">
        <a-table
          :columns="tableColumns"
          :data-source="tableData"
          :pagination="tablePagination"
          :scroll="{ x: 'max-content' }"
          size="small"
          bordered
        />
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
  DownOutlined
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

// 定义 Props
const props = defineProps<{
  /** 执行结果 */
  result: ExecutionResult
}>()

// JSON 折叠状态
const jsonCollapsed = ref(false)

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

  // 支持 type 和 outputType 两种字段名
  const outputType = props.result.type || props.result.outputType
  if (outputType) {
    return outputType
  }

  const data = props.result.data

  if (data === undefined || data === null) {
    return 'empty'
  }

  if (Array.isArray(data) && data.length > 0) {
    const firstItem = data[0]
    if (typeof firstItem === 'object' && firstItem !== null) {
      return 'table'
    }
    return 'json'
  }

  if (typeof data === 'object') {
    return 'json'
  }

  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data)
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
  const data = props.result.data
  if (!Array.isArray(data) || data.length === 0) {
    return []
  }

  const firstItem = data[0]
  if (typeof firstItem !== 'object' || firstItem === null) {
    return []
  }

  // 从第一个对象的键生成列
  return Object.keys(firstItem).map(key => ({
    title: formatColumnName(key),
    dataIndex: key,
    key: key,
    ellipsis: true,
    width: getColumnWidth(key)
  }))
})

/**
 * 表格数据
 */
const tableData = computed(() => {
  const data = props.result.data
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
 * 表格分页配置
 */
const tablePagination: TableProps['pagination'] = {
  pageSize: 20,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`
}

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
 * 格式化列名
 */
function formatColumnName(key: string): string {
  // 将下划线和驼峰转换为空格分隔的标题格式
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
  // 根据键名推断宽度
  const widthMap: Record<string, number> = {
    rank: 60,
    id: 80,
    url: 200,
    title: 200,
    author: 100,
    name: 120,
    status: 80,
    time: 100,
    date: 100
  }
  return widthMap[key.toLowerCase()]
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

// 当结果变化时重置折叠状态
watch(
  () => props.result,
  () => {
    jsonCollapsed.value = false
  }
)
</script>

<style scoped>
.result-display {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* 结果头部 */
.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
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

.copy-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-text-weak);
  font-size: var(--font-size-xs);
}

.copy-button:hover {
  color: var(--color-primary);
}

.copy-text {
  margin-left: 2px;
}

/* 结果内容区域 */
.result-content {
  padding: var(--spacing-md);
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
.result-table {
  overflow-x: auto;
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

:deep(.ant-table-thead > tr > th) {
  background-color: var(--color-surface);
  font-weight: 500;
}

:deep(.ant-table-tbody > tr > td) {
  max-width: 300px;
}

:deep(.ant-pagination) {
  margin: var(--spacing-md) 0 0 0;
}
</style>
