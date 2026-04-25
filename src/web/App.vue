<template>
  <div class="app-container">
    <!-- 侧边栏 -->
    <Sidebar :active-site-id="activeSite" @select="handleSiteSelect" />

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 欢迎页面 - 未选择站点时显示 -->
      <div v-if="!activeSite" class="welcome-page">
        <div class="welcome-content">
          <h1 class="welcome-title">欢迎使用 Prism</h1>
          <p class="welcome-description">
            Prism 是一个 OpenCLI Web UI，提供多个网站的命令行工具可视化界面。
          </p>
          <p class="welcome-hint">
            👈 请从左侧选择一个网站开始使用
          </p>
        </div>
      </div>

      <!-- 站点页面 - 根据选择显示 -->
      <BilibiliPage v-else-if="activeSite === 'bilibili'" />
      <XiaohongshuPage v-else-if="activeSite === 'xiaohongshu'" />
      <ZhihuPage v-else-if="activeSite === 'zhihu'" />
      <TaobaoPage v-else-if="activeSite === 'taobao'" />
      <CtripPage v-else-if="activeSite === 'ctrip'" />
      <HupuPage v-else-if="activeSite === 'hupu'" />
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
import ZhihuPage from './components/sites/ZhihuPage.vue'
import TaobaoPage from './components/sites/TaobaoPage.vue'
import CtripPage from './components/sites/CtripPage.vue'
import HupuPage from './components/sites/HupuPage.vue'

// 当前选中的站点
const activeSite = ref<string | null>(null)

/**
 * 处理站点选择
 */
const handleSiteSelect = (siteId: string) => {
  activeSite.value = siteId
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
}

.welcome-content {
  text-align: center;
  max-width: 600px;
}

.welcome-title {
  font-size: var(--font-size-4xl);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-lg);
}

.welcome-description {
  font-size: var(--font-size-lg);
  color: var(--color-text-weak);
  margin-bottom: var(--spacing-xl);
  line-height: 1.6;
}

.welcome-hint {
  font-size: var(--font-size-md);
  color: var(--color-primary);
  padding: var(--spacing-md);
  background-color: var(--color-background);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}
</style>
