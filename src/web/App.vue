<template>
  <a-layout>
    <a-layout-header>
      <h1>Prism</h1>
    </a-layout-header>
    <a-layout-content>
      <SiteSelector @select="handleSiteSelect" />
      <OperationList v-if="selectedSite" :site="selectedSite" />
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SiteSelector from './components/SiteSelector.vue'
import OperationList from './components/OperationList.vue'

const selectedSite = ref<string | null>(null)

const handleSiteSelect = (site: string) => {
  selectedSite.value = site
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
