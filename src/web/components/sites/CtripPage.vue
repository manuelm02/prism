<template>
  <div class="site-page">
    <header class="site-header">
      <div class="header-left">
        <component :is="siteIcon" class="header-icon" />
        <div class="header-content">
          <h1 class="header-title">{{ siteConfig.name }}</h1>
          <p class="header-desc">{{ siteConfig.description }}</p>
        </div>
      </div>
    </header>

    <div class="page-container">
      <div class="operation-selector">
        <label class="selector-label">选择操作</label>
        <a-select
          v-model:value="activeCommand"
          class="operation-select"
          placeholder="请选择操作类型"
        >
          <a-select-option v-for="command in siteConfig.commands" :key="command.id" :value="command.id">
            <div class="select-option-content">
              <span class="option-name">{{ command.name }}</span>
              <span class="option-desc">{{ command.description }}</span>
            </div>
          </a-select-option>
        </a-select>
      </div>

      <div class="content-area">
        <div class="params-panel">
          <div class="panel-header">
            <h3 class="panel-title">填写信息</h3>
            <p v-if="currentCommand" class="panel-desc">{{ currentCommand.description }}</p>
          </div>
          <div class="panel-body">
            <ParamForm
              v-if="currentCommand"
              :params="currentCommand.params"
              :loading="loading"
              site-id="ctrip"
              @submit="handleExecute"
            />
            <div v-else class="empty-params">
              <span>请先选择操作类型</span>
            </div>
          </div>
        </div>

        <div class="result-panel">
          <div class="panel-header">
            <div class="panel-header-left">
              <h3 class="panel-title">查询结果</h3>
              <p v-if="currentCommand" class="panel-desc">{{ currentCommand.description }}</p>
            </div>
            <span v-if="result" class="result-status" :class="result.success ? 'success' : 'error'">
              {{ result.success ? '成功' : '失败' }}
            </span>
          </div>
          <div class="panel-body">
            <div v-if="result" class="result-content">
              <ResultDisplay :result="result" />
            </div>
            <div v-else class="result-placeholder">
              <div class="placeholder-icon">📋</div>
              <p class="placeholder-text">填写信息后点击"开始查询"查看结果</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { EnvironmentOutlined } from '@ant-design/icons-vue'
import ParamForm from '../common/ParamForm.vue'
import ResultDisplay from '../common/ResultDisplay.vue'
import { getSiteConfig } from '../../utils/adapter-config'
import type { ExecutionResult } from '../common/ResultDisplay.vue'

const siteConfig = getSiteConfig('ctrip')!
const activeCommand = ref<string>(siteConfig.commands[0]?.id || '')
const result = ref<ExecutionResult | null>(null)
const loading = ref(false)

const siteIcon = computed(() => {
  const icons: Record<string, any> = {
    ctrip: EnvironmentOutlined
  }
  return icons[siteConfig.id] || EnvironmentOutlined
})

const currentCommand = computed(() => {
  if (!activeCommand.value) return null
  return siteConfig.commands.find(cmd => cmd.id === activeCommand.value)
})

// 监听操作切换，清空结果
watch(activeCommand, () => {
  result.value = null
})

async function handleExecute(paramValues: Record<string, string | number | boolean>) {
  if (!currentCommand.value) return
  
  loading.value = true
  
  try {
    const response = await fetch('/api/sites/ctrip/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: currentCommand.value.id, params: paramValues })
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      result.value = {
        success: true,
        data: data.data,
        outputType: currentCommand.value.outputType
      }
    } else {
      result.value = {
        success: false,
        error: data.error || `请求失败: ${response.status}`
      }
    }
  } catch (error) {
    result.value = {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.site-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
}

.site-header {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  padding: 24px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  font-size: 32px;
}

.header-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.5px;
}

.header-desc {
  font-size: 14px;
  margin: 4px 0 0 0;
  opacity: 0.9;
}

.page-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.operation-selector {
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.selector-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.operation-select {
  width: 100%;
}

.select-option-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.option-name {
  font-weight: 500;
  color: #1f2937;
}

.option-desc {
  font-size: 12px;
  color: #6b7280;
}

.content-area {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 24px;
  min-height: calc(100vh - 280px);
}

.params-panel,
.result-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.panel-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e8eaed;
  background: #fafbfc;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.panel-header-left {
  flex: 1;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.panel-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 8px 0 0 0;
}

.panel-body {
  padding: 24px;
  max-height: 400px;
  overflow-y: auto;
}

.result-status {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  flex-shrink: 0;
  margin-top: 4px;
}

.result-status.success {
  background: #d1fae5;
  color: #059669;
}

.result-status.error {
  background: #fee2e2;
  color: #dc2626;
}

.result-content {
  min-height: 300px;
}

.result-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #9ca3af;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.placeholder-text {
  font-size: 15px;
  margin: 0;
}

.empty-params {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}

@media (max-width: 768px) {
  .content-area {
    grid-template-rows: auto auto;
  }
  
  .panel-body {
    max-height: none;
  }
}
</style>