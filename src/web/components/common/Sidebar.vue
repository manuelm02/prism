<template>
  <aside class="sidebar">
    <!-- 头部 -->
    <div class="sidebar-header">
      <h1 class="sidebar-title">Prism</h1>
      <p class="sidebar-subtitle">OpenCLI Web UI</p>
    </div>

    <!-- 网站列表 -->
    <nav class="sidebar-nav">
      <div
        v-for="site in sites"
        :key="site.id"
        :class="['sidebar-item', { active: activeSiteId === site.id }]"
        @click="handleSelect(site.id)"
      >
        <span class="sidebar-item-icon">{{ site.icon }}</span>
        <span class="sidebar-item-name">{{ site.name }}</span>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { siteConfigs, type SiteConfig } from '../../utils/adapter-config'

// 定义 props
defineProps<{
  activeSiteId?: string
}>()

// 定义 emits
const emit = defineEmits<{
  select: [siteId: string]
}>()

// 网站列表
const sites = ref<SiteConfig[]>(siteConfigs)

// 处理选择事件
const handleSelect = (siteId: string) => {
  emit('select', siteId)
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  height: 100vh;
  background-color: var(--color-background);
  border-right: 1px solid var(--color-border);
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: var(--spacing-md) var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.sidebar-title {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  line-height: 1.2;
}

.sidebar-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-weak);
  margin: var(--spacing-xs) 0 0 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  user-select: none;
}

.sidebar-item:hover {
  background-color: var(--color-surface);
}

.sidebar-item.active {
  background-color: var(--color-primary);
  color: white;
}

.sidebar-item-icon {
  font-size: var(--font-size-lg);
  line-height: 1;
}

.sidebar-item-name {
  font-size: var(--font-size-md);
  font-weight: 500;
}
</style>
