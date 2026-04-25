<template>
  <a-list :data-source="operations" :loading="loading">
    <template #renderItem="{ item }">
      <a-list-item>
        <OperationItem :operation="item" />
      </a-list-item>
    </template>
  </a-list>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Command } from '../../utils/types'
import OperationItem from './OperationItem.vue'

const props = defineProps<{
  site: string
}>()

const operations = ref<Command[]>([])
const loading = ref(false)

watch(() => props.site, async (newSite) => {
  loading.value = true
  const response = await fetch(`/api/adapters/${newSite}`)
  const adapter = await response.json()
  operations.value = adapter.commands
  loading.value = false
}, { immediate: true })
</script>