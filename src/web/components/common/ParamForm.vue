<template>
  <div class="param-form">
    <!-- 表单内容框 -->
    <div class="form-content-box">
      <!-- 无参数时的提示 -->
      <div v-if="visibleParams.length === 0" class="no-params-hint">
        <p class="hint-text">无需填写额外信息，点击下方按钮即可查询</p>
      </div>
      
      <!-- 表单字段 - 两列布局 -->
      <div v-else class="form-grid">
        <div v-for="param in visibleParams" :key="param.name" :class="['param-field', { 'full-width': isFullWidth(param) }]">
          <!-- 标签行 -->
          <div class="param-label-row">
            <label class="param-label">
              {{ param.friendlyName }}
              <span v-if="param.required" class="param-required">*</span>
            </label>
            <a-tooltip v-if="param.description" placement="top">
              <template #title>
                <span class="tooltip-text">{{ param.description }}</span>
              </template>
              <QuestionCircleOutlined class="param-help-icon" />
            </a-tooltip>
          </div>

          <!-- 输入控件 -->
          <div class="param-input">
            <!-- 路径类型（带文件夹选择按钮） -->
            <div v-if="isPathParam(param)" class="path-input-wrapper">
              <a-input
                v-model:value="formValues[param.name]"
                :placeholder="getPlaceholder(param)"
                allow-clear
              >
                <template #prefix>
                  <FolderOutlined class="param-path-icon" />
                </template>
              </a-input>
              <a-button 
                type="default" 
                class="path-select-btn"
                @click="selectFolder(param.name)"
              >
                选择
              </a-button>
            </div>

            <!-- 字符串类型 -->
            <a-input
              v-else-if="param.type === 'string'"
              v-model:value="formValues[param.name]"
              :placeholder="getPlaceholder(param)"
              allow-clear
            />

          <!-- 数字类型 - 带加减按钮 -->
          <div v-else-if="param.type === 'number'" class="number-input-wrapper">
            <a-button 
              class="number-btn minus" 
              @click="decrementNumber(param.name)"
              :disabled="!canDecrement(param.name)"
            >
              <MinusOutlined />
            </a-button>
            <a-input-number
              v-model:value="formValues[param.name]"
              :placeholder="getPlaceholder(param)"
              class="param-number-input"
              :min="1"
              :max="100"
            />
            <a-button 
              class="number-btn plus" 
              @click="incrementNumber(param.name)"
              :disabled="!canIncrement(param.name)"
            >
              <PlusOutlined />
            </a-button>
          </div>

          <!-- 布尔类型 -->
          <a-switch
            v-else-if="param.type === 'boolean'"
            v-model:checked="formValues[param.name]"
          />

          <!-- 选择类型 -->
          <a-select
            v-else-if="param.type === 'select'"
            v-model:value="formValues[param.name]"
            :placeholder="`请选择${param.friendlyName}`"
            allow-clear
          >
            <a-select-option
              v-for="option in param.options"
              :key="option"
              :value="option"
            >
              {{ getOptionLabel(option) }}
            </a-select-option>
          </a-select>
        </div>
      </div>
    </div>
    </div>

    <!-- 提交按钮 -->
    <div class="param-actions">
      <a-button
        type="primary"
        :loading="loading"
        :disabled="!isFormValid"
        @click="handleSubmit"
      >
        {{ loading ? '查询中...' : '开始查询' }}
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch, onMounted } from 'vue'
import { FolderOutlined, MinusOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { ParamConfig } from '../../utils/adapter-config'

// 定义 Props
const props = defineProps<{
  /** 参数配置数组 */
  params: ParamConfig[]
  /** 加载状态 */
  loading?: boolean
  /** 外部传入的值（用于联动填充） */
  externalValues?: Record<string, string>
  /** 站点ID（用于设置下载路径） */
  siteId?: string
}>()

// 定义 Emits
const emit = defineEmits<{
  /** 提交表单时触发，返回表单值 */
  submit: [values: Record<string, string | number | boolean>]
  /** 清除外部值 */
  clearExternal: []
}>()

// 表单值
const formValues = reactive<Record<string, string | number | boolean>>({})

// 只显示未隐藏的参数
const visibleParams = computed(() => {
  return props.params.filter(p => !p.hidden)
})

// 下拉选项的中文映射
const optionLabelMap: Record<string, string> = {
  // 搜索类型
  video: '视频',
  user: '用户',
  // 排序方式
  default: '默认排序',
  sale: '按销量',
  price: '按价格',
  pubdate: '按发布时间',
  click: '按播放量',
  stow: '按收藏数',
  // 视频质量
  best: '最高画质',
  '1080p': '1080P 高清',
  '720p': '720P 标清',
  '480p': '480P 流畅',
  // 类型过滤
  all: '全部',
  article: '文章',
  draw: '图片',
  text: '纯文字',
  // 统计周期
  seven: '最近7天',
  thirty: '最近30天',
  // 通知类型
  mentions: '提及',
  likes: '点赞',
  connections: '关注',
  // 其他
  ai: 'AI字幕'
}

/**
 * 获取下拉选项的中文标签
 */
function getOptionLabel(option: string): string {
  return optionLabelMap[option] || option
}

/**
 * 判断是否需要占整行（字符串输入框和路径输入框）
 */
function isFullWidth(param: ParamConfig): boolean {
  return param.type === 'string' || isPathParam(param)
}

/**
 * 初始化表单默认值
 */
const initDefaultValues = async () => {
  for (const param of props.params) {
    // 如果有外部值则优先使用
    if (props.externalValues && props.externalValues[param.name]) {
      formValues[param.name] = props.externalValues[param.name]
    } else if (formValues[param.name] === undefined) {
      // 路径参数优先使用系统下载目录
      if (isPathParam(param)) {
        try {
          const subFolder = getDownloadSubFolder(param.name)
          const url = `/api/system/download-folder?subFolder=${encodeURIComponent(subFolder)}`
          const response = await fetch(url)
          const data = await response.json()
          if (data.success && data.path) {
            formValues[param.name] = data.path
          } else {
            formValues[param.name] = ''
          }
        } catch {
          formValues[param.name] = ''
        }
      } else if (param.default !== undefined) {
        formValues[param.name] = param.default
      } else if (param.type === 'boolean') {
        formValues[param.name] = false
      } else if (param.type === 'number') {
        formValues[param.name] = undefined as unknown as number
      } else {
        formValues[param.name] = ''
      }
    }
  }
}

/**
 * 根据参数名和站点ID获取下载子文件夹名
 */
function getDownloadSubFolder(paramName: string): string {
  const siteFolderMap: Record<string, string> = {
    bilibili: 'Prism/B站',
    xiaohongshu: 'Prism/小红书',
    taobao: 'Prism/淘宝',
    ctrip: 'Prism/携程'
  }
  
  if (paramName === 'output' || paramName === 'output-dir' || paramName === 'save-dir') {
    return siteFolderMap[props.siteId || ''] || 'Prism'
  }
  
  return 'Prism'
}

// 监听外部值变化
watch(
  () => props.externalValues,
  (newValues) => {
    if (newValues) {
      for (const [key, value] of Object.entries(newValues)) {
        formValues[key] = value
      }
    }
  },
  { immediate: true, deep: true }
)

/**
 * 判断是否为路径参数
 * 通过参数名或描述中包含 path、output、dir 等关键词判断
 */
const isPathParam = (param: ParamConfig): boolean => {
  const pathKeywords = ['path', 'output', 'dir', 'directory', 'folder']
  const nameLower = param.name.toLowerCase()
  const descLower = param.description.toLowerCase()
  return pathKeywords.some(keyword => 
    nameLower.includes(keyword) || descLower.includes(keyword)
  )
}

/**
 * 选择文件夹
 */
async function selectFolder(paramName: string) {
  try {
    const response = await fetch('/api/system/select-folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await response.json()
    
    if (data.success && data.path) {
      formValues[paramName] = data.path
      message.success('已选择文件夹')
    }
  } catch (error) {
    message.error('选择文件夹失败')
  }
}

/**
 * 数字加减控制
 */
function incrementNumber(paramName: string) {
  const current = Number(formValues[paramName]) || 0
  if (current < 100) {
    formValues[paramName] = current + 1
  }
}

function decrementNumber(paramName: string) {
  const current = Number(formValues[paramName]) || 0
  if (current > 1) {
    formValues[paramName] = current - 1
  }
}

function canIncrement(paramName: string): boolean {
  const current = Number(formValues[paramName]) || 0
  return current < 100
}

function canDecrement(paramName: string): boolean {
  const current = Number(formValues[paramName]) || 0
  return current > 1
}

/**
 * 获取占位符文本
 */
const getPlaceholder = (param: ParamConfig): string => {
  if (isPathParam(param)) {
    return `点击"选择"按钮选择${param.friendlyName}`
  }
  return `请输入${param.friendlyName}`
}

/**
 * 表单验证
 */
const isFormValid = computed(() => {
  for (const param of props.params) {
    if (param.required) {
      const value = formValues[param.name]
      // 检查必填字段是否有值
      if (value === undefined || value === '' || value === null) {
        return false
      }
    }
  }
  return true
})

/**
 * 处理提交
 */
const handleSubmit = () => {
  // 构建提交数据，过滤掉空值
  const submitValues: Record<string, string | number | boolean> = {}
  for (const param of props.params) {
    const value = formValues[param.name]
    // 只包含有值的参数
    if (value !== undefined && value !== '' && value !== null) {
      submitValues[param.name] = value
    }
  }
  emit('submit', submitValues)
}

/**
 * 重置表单
 */
const resetForm = () => {
  for (const key of Object.keys(formValues)) {
    delete formValues[key]
  }
  initDefaultValues()
}

// 监听 params 变化，重新初始化默认值
watch(
  () => props.params,
  () => {
    initDefaultValues()
  },
  { immediate: true, deep: true }
)

// 组件挂载时初始化
onMounted(() => {
  initDefaultValues()
})

// 暴露方法供父组件调用
defineExpose({
  resetForm,
  formValues
})
</script>

<style scoped>
.param-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-content-box {
  background: #f8fafc;
  border-radius: var(--radius-md);
  border: 1px solid #e8eaed;
  padding: var(--spacing-lg);
}

.no-params-hint {
  text-align: center;
  padding: var(--spacing-md) 0;
}

.hint-text {
  margin: 0;
  color: var(--color-text-weak);
  font-size: var(--font-size-sm);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md) var(--spacing-lg);
}

.param-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.param-field.full-width {
  grid-column: 1 / -1;
}

.param-label-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.param-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text);
}

.param-required {
  color: #ff4d4f;
  margin-left: 2px;
}

.param-help-icon {
  font-size: 14px;
  color: #9ca3af;
  cursor: help;
  margin-left: 4px;
}

.param-help-icon:hover {
  color: #6b7280;
}

.tooltip-text {
  white-space: pre-line;
}

.param-input {
  width: 100%;
}

.path-input-wrapper {
  display: flex;
  gap: 8px;
}

.path-input-wrapper .ant-input-affix-wrapper {
  flex: 1;
}

.path-select-btn {
  flex-shrink: 0;
}

.number-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.number-input-wrapper:hover {
  border-color: #4096ff;
}

.number-input-wrapper:focus-within {
  border-color: #4096ff;
  box-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1);
}

.number-btn {
  width: 36px;
  height: 32px;
  border: none !important;
  background: #fafafa !important;
  border-radius: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.number-btn:hover:not(:disabled) {
  background: #f0f0f0 !important;
  color: #4096ff !important;
}

.number-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.param-number-input {
  flex: 1;
  border: none !important;
  box-shadow: none !important;
}

.param-number-input :deep(.ant-input-number-input) {
  text-align: center;
  font-weight: 500;
}

.param-number-input :deep(.ant-input-number-handler-wrap) {
  display: none;
}

.param-path-icon {
  color: var(--color-text-weak);
}

.param-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--spacing-md);
}

/* Ant Design Vue 组件样式覆盖 */
:deep(.ant-input),
:deep(.ant-select-selector),
:deep(.ant-input-number) {
  border-radius: var(--radius-md);
}

:deep(.ant-input:focus),
:deep(.ant-input-focused),
:deep(.ant-select-focused .ant-select-selector),
:deep(.ant-input-number-focused) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(27, 97, 201, 0.2);
}

:deep(.ant-btn-primary) {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  border-radius: var(--radius-md);
  font-weight: 500;
}

:deep(.ant-btn-primary:hover) {
  background-color: #1557a8;
  border-color: #1557a8;
}

:deep(.ant-btn-primary:disabled) {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
}
</style>
