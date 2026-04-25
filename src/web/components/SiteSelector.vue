<template>
  <a-select
    v-model:value="selectedSite"
    placeholder="Select a website"
    style="width: 100%"
    @change="handleChange"
  >
    <a-select-option v-for="site in sites" :key="site.name" :value="site.name">
      {{ site.name }} - {{ site.description }}
    </a-select-option>
  </a-select>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Adapter } from '../../utils/types'

const emit = defineEmits<{
  (e: 'select', site: string): void
}>()

const sites = ref<Adapter[]>([])
const selectedSite = ref<string | undefined>(undefined)

onMounted(async () => {
  const response = await fetch('/api/adapters')
  sites.value = await response.json()
})

const handleChange = (value: string) => {
  emit('select', value)
}
</script>