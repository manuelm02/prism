<template>
  <div class="bilibili-page">
    <!-- 页面头部 -->
    <header class="page-header">
      <div class="header-icon">{{ siteConfig.icon }}</div>
      <div class="header-info">
        <h1 class="header-title">{{ siteConfig.name }}</h1>
        <p class="header-description">{{ siteConfig.description }}</p>
      </div>
    </header>

    <!-- 命令卡片网格 -->
    <div class="commands-grid">
      <div
        v-for="command in siteConfig.commands"
        :key="command.id"
        class="command-card"
      >
        <!-- 卡片头部 -->
        <div class="card-header">
          <h3 class="card-title">{{ command.name }}</h3>
          <p class="card-description">{{ command.description }}</p>
        </div>

        <!-- 参数表单 -->
        <div class="card-form">
          <ParamForm
            :params="command.params"
            :loading="loadingStates[command.id]"
            @submit="(values) => handleExecute(command, values)"
          />
        </div>

        <!-- 结果展示 -->
        <div v-if="results[command.id]" class="card-result">
          <ResultDisplay :result="results[command.id]" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import ParamForm from '../common/ParamForm.vue'
import ResultDisplay from '../common/ResultDisplay.vue'
import { getSiteConfig, type CommandConfig, type ParamConfig } from '../../utils/adapter-config'
import type { ExecutionResult } from '../common/ResultDisplay.vue'

// 获取 Bilibili 网站配置
const siteConfig = getSiteConfig('bilibili')!

// 每个命令的执行结果
const results = reactive<Record<string, ExecutionResult>>({})

// 每个命令的加载状态
const loadingStates = reactive<Record<string, boolean>>({})

/**
 * 执行命令
 */
async function handleExecute(
  command: CommandConfig,
  paramValues: Record<string, string | number | boolean>
) {
  loadingStates[command.id] = true

  try {
    const response = await fetch('/api/sites/bilibili/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        command: command.id,
        params: paramValues
      })
    })

    const data = await response.json()

    if (response.ok && data.success) {
      // 成功结果
      results[command.id] = {
        success: true,
        data: data.data,
        outputType: command.outputType
      }
    } else {
      // 错误结果
      results[command.id] = {
        success: false,
        error: data.error || `请求失败: ${response.status} ${response.statusText}`
      }
    }
  } catch (error) {
    // 网络错误或其他异常
    results[command.id] = {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  } finally {
    // 清除加载状态
    loadingStates[command.id] = false
  }
}
</script>

<style scoped>
.bilibili-page {
  padding: var(--spacing-lg);
  max-width: 1400px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.header-icon {
  font-size: 48px;
  line-height: 1;
}

.header-info {
  flex: 1;
}

.header-title {
  font-size: var(--font-size-3xl);
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 var(--spacing-xs) 0;
}

.header-description {
  font-size: var(--font-size-md);
  color: var(--color-text-weak);
  margin: 0;
}

/* 命令卡片网格 */
.commands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: var(--spacing-lg);
}

/* 命令卡片 */
.command-card {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: 500;
  color: var(--color-text);
  margin: 0 0 var(--spacing-xs) 0;
}

.card-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-weak);
  margin: 0;
  line-height: 1.4;
}

.card-form {
  padding: var(--spacing-md);
}

.card-result {
  padding: var(--spacing-md);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .bilibili-page {
    padding: var(--spacing-md);
  }

  .commands-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }

  .header-icon {
    font-size: 36px;
  }

  .header-title {
    font-size: var(--font-size-2xl);
  }
}
</style>
