<template>
  <a-card :title="operation.name">
    <p>{{ operation.description }}</p>
    <a-form :model="formState" @finish="handleExecute">
      <a-form-item v-for="param in operation.parameters" :key="param.name" :label="param.friendlyName">
        <a-input v-if="param.type === 'string'" v-model:value="formState[param.name]" />
        <a-input-number v-if="param.type === 'number'" v-model:value="formState[param.name]" />
        <a-select v-if="param.type === 'select'" v-model:value="formState[param.name]">
          <a-select-option v-for="option in param.options" :key="option" :value="option">
            {{ option }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" :loading="executing">
          Execute
        </a-button>
      </a-form-item>
    </a-form>
    <ResultDisplay v-if="result" :result="result" />
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Command, ExecutionResult } from '../../utils/types'
import ResultDisplay from './ResultDisplay.vue'

const props = defineProps<{
  operation: Command
}>()

const formState = reactive<Record<string, any>>({})
const executing = ref(false)
const result = ref<ExecutionResult | null>(null)

const handleExecute = async () => {
  executing.value = true
  const response = await fetch(`/api/execute/${props.operation.name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formState)
  })
  result.value = await response.json()
  executing.value = false
}
</script>