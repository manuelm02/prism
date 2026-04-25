<template>
  <a-alert v-if="result.success" type="success" show-icon>
    <template #message>
      <span>Execution Successful</span>
    </template>
    <template #description>
      <pre v-if="result.data">{{ result.data }}</pre>
      <p v-if="result.filePath">File saved to: {{ result.filePath }}</p>
    </template>
  </a-alert>
  <a-alert v-else type="error" show-icon>
    <template #message>
      <span>Execution Failed</span>
    </template>
    <template #description>
      <pre>{{ result.error }}</pre>
    </template>
  </a-alert>
</template>

<script setup lang="ts">
import { ExecutionResult } from '../../utils/types'

defineProps<{
  result: ExecutionResult
}>()
</script>