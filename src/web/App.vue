<template>
  <div class="app-container">
    <!-- 侧边栏 -->
    <Sidebar :active-site-id="activeSite" @select="handleSiteSelect" @home="handleHome" />

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 欢迎页面 - 未选择站点时显示 -->
      <div v-if="!activeSite" class="welcome-page">
        <div class="welcome-container">
          <!-- Logo 区域 -->
          <div class="logo-section">
            <div class="logo-mark">
              <svg viewBox="0 0 80 80" fill="none" class="logo-svg">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#2563EB" />
                    <stop offset="100%" style="stop-color:#3B82F6" />
                  </linearGradient>
                  <filter id="logoGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <!-- 外框 -->
                <rect x="8" y="8" width="64" height="64" rx="16" fill="url(#logoGradient)" />
                <!-- 内部棱镜形状 -->
                <path d="M40 16L56 40L40 64L24 40L40 16Z" fill="white" fill-opacity="0.9" />
                <!-- 中心光点 -->
                <circle cx="40" cy="40" r="8" fill="url(#logoGradient)" filter="url(#logoGlow)" />
                <!-- 光线折射效果 -->
                <path d="M28 28L40 40M52 28L40 40M28 52L40 40M52 52L40 40" stroke="white" stroke-width="2" stroke-linecap="round" stroke-opacity="0.6" />
              </svg>
            </div>
            <h1 class="welcome-title">Prism</h1>
            <p class="welcome-subtitle">多平台数据小助手</p>
          </div>

          <!-- 描述区域 -->
          <div class="description-section">
            <p class="welcome-description">
              统一的多平台数据采集与管理工具，为 OpenCLI 提供可视化操作界面
            </p>
          </div>

          <!-- 功能特性 -->
          <div class="features-section">
            <div class="feature-item">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div class="feature-content">
                <h3 class="feature-title">多平台支持</h3>
                <p class="feature-desc">哔哩哔哩、小红书、携程、淘宝</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <div class="feature-content">
                <h3 class="feature-title">可视化操作</h3>
                <p class="feature-desc">友好的参数配置与结果展示</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <div class="feature-content">
                <h3 class="feature-title">快速执行</h3>
                <p class="feature-desc">一键调用命令行工具</p>
              </div>
            </div>
          </div>

          <!-- 引导提示 -->
          <div class="guide-section">
            <div class="guide-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </div>
            <p class="guide-text">从左侧选择平台开始使用</p>
          </div>
        </div>
      </div>

      <!-- 站点页面 - 根据选择显示 -->
      <BilibiliPage v-else-if="activeSite === 'bilibili'" />
      <XiaohongshuPage v-else-if="activeSite === 'xiaohongshu'" />
      <TaobaoPage v-else-if="activeSite === 'taobao'" />
      <CtripPage v-else-if="activeSite === 'ctrip'" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 导入设计系统样式
import './styles/design-system.css'

// 导入侧边栏组件
import Sidebar from './components/common/Sidebar.vue'

// 导入各站点页面组件
import BilibiliPage from './components/sites/BilibiliPage.vue'
import XiaohongshuPage from './components/sites/XiaohongshuPage.vue'
import TaobaoPage from './components/sites/TaobaoPage.vue'
import CtripPage from './components/sites/CtripPage.vue'

// 当前选中的站点
const activeSite = ref<string | undefined>(undefined)

/**
 * 处理站点选择
 */
const handleSiteSelect = (siteId: string) => {
  activeSite.value = siteId
}

/**
 * 返回欢迎页面
 */
const handleHome = () => {
  activeSite.value = undefined
}
</script>

<style>
/* 全局样式重置 */
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

/* 应用容器 - flex 布局 */
.app-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

/* 主内容区 */
.main-content {
  flex: 1;
  min-height: 100vh;
  overflow-y: auto;
  background-color: var(--color-surface);
}

/* 欢迎页面 */
.welcome-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.welcome-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 640px;
  text-align: center;
}

/* Logo 区域 */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48px;
}

.logo-mark {
  width: 120px;
  height: 120px;
  margin-bottom: 24px;
  animation: float 3s ease-in-out infinite;
}

.logo-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 8px 24px rgba(37, 99, 235, 0.25));
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.welcome-title {
  font-size: 48px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  letter-spacing: -1px;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 18px;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

/* 描述区域 */
.description-section {
  margin-bottom: 48px;
}

.welcome-description {
  font-size: 16px;
  color: #475569;
  margin: 0;
  line-height: 1.7;
  max-width: 480px;
}

/* 功能特性 */
.features-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 48px;
  width: 100%;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.feature-item:hover {
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
  transform: translateY(-2px);
}

.feature-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 12px;
  margin-bottom: 16px;
  color: #2563eb;
}

.feature-icon svg {
  width: 24px;
  height: 24px;
}

.feature-content {
  text-align: center;
}

.feature-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.feature-desc {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

/* 引导提示 */
.guide-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  border-radius: 12px;
  color: white;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(37, 99, 235, 0);
  }
}

.guide-arrow {
  width: 24px;
  height: 24px;
  animation: slideLeft 1.5s ease-in-out infinite;
}

.guide-arrow svg {
  width: 100%;
  height: 100%;
}

@keyframes slideLeft {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-4px);
  }
}

.guide-text {
  font-size: 15px;
  font-weight: 500;
  margin: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .features-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .welcome-title {
    font-size: 36px;
  }
  
  .logo-mark {
    width: 96px;
    height: 96px;
  }
}
</style>
