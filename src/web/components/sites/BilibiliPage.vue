<template>
  <div class="site-page">
    <header class="site-header">
      <div class="header-badge">
        <span class="header-icon">{{ siteConfig.icon }}</span>
      </div>
      <div class="header-content">
        <h1 class="header-title">{{ siteConfig.name }}</h1>
        <p class="header-desc">{{ siteConfig.description }}</p>
      </div>
      <div class="header-stats">
        <span class="stat-item">
          <span class="stat-value">{{ siteConfig.commands.length }}</span>
          <span class="stat-label">功能</span>
        </span>
      </div>
    </header>

    <div class="tabs-container">
      <a-tabs v-model:activeKey="activeCommand" type="card" class="command-tabs">
        <a-tab-pane v-for="command in siteConfig.commands" :key="command.id">
          <template #tab>
            <span class="tab-label">
              <span class="tab-name">{{ command.name }}</span>
            </span>
          </template>
          
          <div class="command-panel">
            <div class="panel-sidebar">
              <div class="command-info">
                <h2 class="command-title">{{ command.name }}</h2>
                <p class="command-desc">{{ command.description }}</p>
              </div>
              
              <div class="params-section">
                <h3 class="section-title">参数配置</h3>
                <ParamForm
                  :params="command.params"
                  :loading="loadingStates[command.id]"
                  @submit="(values) => handleExecute(command, values)"
                />
              </div>
            </div>
            
            <div class="panel-main">
              <div class="result-section">
                <div class="result-header">
                  <h3 class="section-title">执行结果</h3>
                  <span v-if="results[command.id]" class="result-status" :class="results[command.id].success ? 'success' : 'error'">
                    {{ results[command.id].success ? '成功' : '失败' }}
                  </span>
                </div>
                
                <div v-if="results[command.id]" class="result-content">
                  <ResultDisplay :result="results[command.id]" />
                </div>
                
                <div v-else class="result-placeholder">
                  <div class="placeholder-icon">📋</div>
                  <p class="placeholder-text">填写参数后点击"执行"查看结果</p>
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import ParamForm from '../common/ParamForm.vue'
import ResultDisplay from '../common/ResultDisplay.vue'
import { getSiteConfig, type CommandConfig } from '../../utils/adapter-config'
import type { ExecutionResult } from '../common/ResultDisplay.vue'

const siteConfig = getSiteConfig('bilibili')!
const activeCommand = ref(siteConfig.commands[0]?.id || '')
const results = reactive<Record<string, ExecutionResult>>({})
const loadingStates = reactive<Record<string, boolean>>({})

async function handleExecute(
  command: CommandConfig,
  paramValues: Record<string, string | number | boolean>
) {
  loadingStates[command.id] = true
  
  try {
    const response = await fetch('/api/sites/bilibili/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: command.id, params: paramValues })
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      results[command.id] = {
        success: true,
        data: data.data,
        outputType: command.outputType
      }
    } else {
      results[command.id] = {
        success: false,
        error: data.error || `请求失败: ${response.status}`
      }
    }
  } catch (error) {
    results[command.id] = {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  } finally {
    loadingStates[command.id] = false
  }
}
</script>

<style scoped>
.site-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
}

.site-header {
  background: linear-gradient(135deg, #00a1d6 0%, #00b5e2 100%);
  padding: 32px 40px;
  display: flex;
  align-items: center;
  gap: 24px;
  color: white;
  position: relative;
  overflow: hidden;
}

.site-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.3;
}

.header-badge {
  width: 72px;
  height: 72px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
}

.header-icon {
  font-size: 36px;
}

.header-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.header-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
}

.header-desc {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
}

.header-stats {
  display: flex;
  gap: 24px;
  position: relative;
  z-index: 1;
}

.stat-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.15);
  padding: 12px 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

.tabs-container {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.command-tabs {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.command-tabs :deep(.ant-tabs-nav) {
  background: #fafbfc;
  border-bottom: 1px solid #e8eaed;
  padding: 8px 16px 0;
  margin: 0;
}

.command-tabs :deep(.ant-tabs-tab) {
  border-radius: 10px 10px 0 0 !important;
  border: 1px solid transparent !important;
  background: transparent !important;
  padding: 12px 20px !important;
  margin: 0 4px !important;
  transition: all 0.2s ease;
}

.command-tabs :deep(.ant-tabs-tab:hover) {
  background: #f0f2f5 !important;
}

.command-tabs :deep(.ant-tabs-tab-active) {
  background: white !important;
  border-color: #e8eaed !important;
  border-bottom-color: white !important;
}

.command-tabs :deep(.ant-tabs-ink-bar) {
  display: none;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-name {
  font-weight: 500;
  color: #1f2937;
}

.command-tabs :deep(.ant-tabs-tab-active) .tab-name {
  color: #00a1d6;
}

.command-tabs :deep(.ant-tabs-content) {
  padding: 0;
}

.command-panel {
  display: grid;
  grid-template-columns: 360px 1fr;
  min-height: 600px;
}

.panel-sidebar {
  background: #fafbfc;
  border-right: 1px solid #e8eaed;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.command-info {
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e8eaed;
}

.command-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.command-desc {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
}

.params-section {
  flex: 1;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

.panel-main {
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.result-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.result-status {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
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
  flex: 1;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.result-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px dashed #d1d5db;
  min-height: 400px;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.placeholder-text {
  font-size: 15px;
  color: #9ca3af;
  margin: 0;
}

@media (max-width: 1024px) {
  .command-panel {
    grid-template-columns: 1fr;
  }
  
  .panel-sidebar {
    border-right: none;
    border-bottom: 1px solid #e8eaed;
  }
  
  .site-header {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }
  
  .header-stats {
    width: 100%;
    justify-content: center;
  }
}
</style>
