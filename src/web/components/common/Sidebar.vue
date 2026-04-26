<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo-container" @click="handleHome">
        <svg class="logo-icon" viewBox="0 0 40 40" fill="none">
          <defs>
            <linearGradient id="sidebarLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#2563EB" />
              <stop offset="100%" style="stop-color:#3B82F6" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="32" height="32" rx="8" fill="url(#sidebarLogoGradient)" />
          <path d="M12 20L20 12L28 20L20 28L12 20Z" fill="white" />
          <circle cx="20" cy="20" r="4" fill="url(#sidebarLogoGradient)" />
          <path d="M16 16L24 24M24 16L16 24" stroke="white" stroke-width="2" stroke-linecap="round" stroke-opacity="0.6" />
        </svg>
        <div class="logo-text">
          <h1 class="sidebar-title">Prism</h1>
          <p class="sidebar-subtitle">多平台数据小助手</p>
        </div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div
        v-for="site in sites"
        :key="site.id"
        :class="['sidebar-item', { active: activeSiteId === site.id }]"
        :style="{ '--site-color': site.themeColor }"
        @click="handleSelect(site.id)"
      >
        <component :is="getSiteIcon(site.id)" class="sidebar-item-icon" />
        <span class="sidebar-item-name">{{ site.name }}</span>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { siteConfigs, type SiteConfig } from '../../utils/adapter-config'
import {
  PlayCircleOutlined,
  BookOutlined,
  ShoppingCartOutlined,
  GlobalOutlined
} from '@ant-design/icons-vue'

defineProps<{
  activeSiteId?: string
}>()

const emit = defineEmits<{
  select: [siteId: string]
  home: []
}>()

const sites = ref<SiteConfig[]>(siteConfigs.map(site => ({
  ...site,
  themeColor: getSiteThemeColor(site.id)
})))

function getSiteThemeColor(siteId: string): string {
  const colors: Record<string, string> = {
    bilibili: '#00a1d6',
    xiaohongshu: '#ef4444',
    ctrip: '#059669',
    taobao: '#9333ea'
  }
  return colors[siteId] || '#1b61c9'
}

function getSiteIcon(siteId: string) {
  const icons: Record<string, any> = {
    bilibili: PlayCircleOutlined,
    xiaohongshu: BookOutlined,
    ctrip: GlobalOutlined,
    taobao: ShoppingCartOutlined
  }
  return icons[siteId] || PlayCircleOutlined
}

const handleSelect = (siteId: string) => {
  emit('select', siteId)
}

const handleHome = () => {
  emit('home')
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
  flex-shrink: 0;
}

.sidebar-header {
  padding: var(--spacing-md) var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
  transition: opacity 0.2s ease;
  border-radius: var(--radius-md);
  padding: var(--spacing-xs);
}

.logo-container:hover {
  opacity: 0.8;
}

.logo-container:active {
  opacity: 0.6;
}

.logo-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.sidebar-subtitle {
  font-size: 13px;
  color: var(--color-text-weak);
  margin: 0;
  line-height: 1.3;
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
  transition: all 0.2s ease;
  user-select: none;
  border: 1px solid transparent;
}

.sidebar-item:hover {
  background-color: var(--color-surface);
  border-color: var(--color-border);
}

.sidebar-item.active {
  background-color: var(--site-color);
  color: white;
  border-color: var(--site-color);
}

.sidebar-item.active:hover {
  background-color: var(--site-color);
  opacity: 0.9;
}

.sidebar-item-icon {
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
}

.sidebar-item-name {
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>