<template>
  <div class="param-form">
    <!-- 表单字段 -->
    <div v-for="param in params" :key="param.name" class="param-field">
      <!-- 标签行 -->
      <div class="param-label-row">
        <label class="param-label">
          {{ param.friendlyName }}
          <span v-if="param.required" class="param-required">*</span>
        </label>
      </div>

      <!-- 描述文本 -->
      <p class="param-description">{{ param.description }}</p>

      <!-- 输入控件 -->
      <div class="param-input">
        <!-- 字符串类型 -->
        <a-input
          v-if="param.type === 'string'"
          v-model:value="formValues[param.name]"
          :placeholder="getPlaceholder(param)"
          allow-clear
        />

        <!-- 数字类型 -->
        <a-input-number
          v-else-if="param.type === 'number'"
          v-model:value="formValues[param.name]"
          :placeholder="getPlaceholder(param)"
          class="param-number-input"
          style="width: 100%"
        />

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
            {{ option }}
          </a-select-option>
        </a-select>

        <!-- 路径类型（带文件夹图标的输入框） -->
        <a-input
          v-else-if="isPathParam(param)"
          v-model:value="formValues[param.name]"
          :placeholder="getPlaceholder(param)"
          allow-clear
        >
          <template #prefix>
            <FolderOutlined class="param-path-icon" />
          </template>
        </a-input>
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
        {{ loading ? '执行中...' : '执行命令' }}
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch, onMounted } from 'vue'
import { FolderOutlined } from '@ant-design/icons-vue'
import type { ParamConfig } from '../../utils/adapter-config'

// 定义 Props
const props = defineProps<{
  /** 参数配置数组 */
  params: ParamConfig[]
  /** 加载状态 */
  loading?: boolean
}>()

// 定义 Emits
const emit = defineEmits<{
  /** 提交表单时触发，返回表单值 */
  submit: [values: Record<string, string | number | boolean>]
}>()

// 表单值
const formValues = reactive<Record<string, string | number | boolean>>({})

/**
 * 初始化表单默认值
 */
const initDefaultValues = () => {
  for (const param of props.params) {
    // 如果已有值则保留，否则设置默认值
    if (formValues[param.name] === undefined) {
      if (param.default !== undefined) {
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
 * 获取占位符文本
 */
const getPlaceholder = (param: ParamConfig): string => {
  if (isPathParam(param)) {
    return `请输入${param.friendlyName}路径`
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

.param-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
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

.param-description {
  font-size: var(--font-size-xs);
  color: var(--color-text-weak);
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1.4;
}

.param-input {
  width: 100%;
}

.param-number-input {
  width: 100%;
}

.param-path-icon {
  color: var(--color-text-weak);
}

.param-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  border-top: 1px solid var(--color-border);
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
