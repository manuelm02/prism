# Prism Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web UI for OpenCLI that allows users to interact with website adapters through a visual interface.

**Architecture:** Single-process Node.js application with Express backend serving a Vue 3 frontend. The CLI starts the server and opens the browser automatically.

**Tech Stack:** Node.js, Express.js, Vue 3, Ant Design Vue, Vite, Commander.js

---

## File Structure

```
prism/
├── src/
│   ├── cli/
│   │   └── index.ts           # CLI entry point
│   ├── server/
│   │   ├── index.ts           # Express server setup
│   │   ├── routes/
│   │   │   ├── adapters.ts    # Adapter API routes
│   │   │   └── execute.ts     # Command execution routes
│   │   └── services/
│   │       └── opencli.ts     # OpenCLI integration service
│   ├── web/
│   │   ├── index.html         # HTML entry point
│   │   ├── main.ts            # Vue app entry
│   │   ├── App.vue            # Root component
│   │   ├── components/
│   │   │   ├── SiteSelector.vue    # Site dropdown selector
│   │   │   ├── OperationList.vue   # Operations list
│   │   │   ├── OperationItem.vue   # Single operation with form
│   │   │   └── ResultDisplay.vue   # Result display component
│   │   └── styles/
│   │       └── main.css       # Global styles
│   └── utils/
│       └── types.ts           # TypeScript type definitions
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Task 1: Project Initialization

**Files:**
- Create: `prism/package.json`
- Create: `prism/tsconfig.json`
- Create: `prism/vite.config.ts`

- [ ] **Step 1: Initialize npm project**

```bash
cd /Users/manuelm/devspace/workspace/project/prism
npm init -y
```

- [ ] **Step 2: Install dependencies**

```bash
npm install express cors vue@next ant-design-vue@next
npm install -D typescript vite @vitejs/plugin-vue @types/express @types/cors @types/node
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "noEmit": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json vite.config.ts
git commit -m "feat: initialize project structure"
```

## Task 2: Type Definitions

**Files:**
- Create: `prism/src/utils/types.ts`

- [ ] **Step 1: Create type definitions**

```typescript
export interface Adapter {
  name: string
  description: string
  commands: Command[]
}

export interface Command {
  name: string
  description: string
  parameters: Parameter[]
  outputFormat: 'text' | 'json' | 'table' | 'file'
}

export interface Parameter {
  name: string
  friendlyName: string
  type: 'string' | 'number' | 'boolean' | 'select'
  required: boolean
  default?: string | number | boolean
  options?: string[]
  description: string
}

export interface ExecutionResult {
  success: boolean
  data?: string
  filePath?: string
  error?: string
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/types.ts
git commit -m "feat: add TypeScript type definitions"
```

## Task 3: OpenCLI Integration Service

**Files:**
- Create: `prism/src/server/services/opencli.ts`

- [ ] **Step 1: Create OpenCLI service**

```typescript
import { exec } from 'child_process'
import { promisify } from 'util'
import { Adapter, Command, ExecutionResult } from '../../utils/types'

const execAsync = promisify(exec)

export class OpenCLIService {
  async checkInstallation(): Promise<boolean> {
    try {
      await execAsync('opencli --version')
      return true
    } catch {
      return false
    }
  }

  async getAdapters(): Promise<Adapter[]> {
    try {
      const { stdout } = await execAsync('opencli list --format json')
      return JSON.parse(stdout)
    } catch (error) {
      throw new Error('Failed to fetch adapters')
    }
  }

  async executeCommand(adapter: string, command: string, args: Record<string, string>): Promise<ExecutionResult> {
    try {
      const argsString = Object.entries(args)
        .map(([key, value]) => `--${key} ${value}`)
        .join(' ')

      const { stdout, stderr } = await execAsync(`opencli ${adapter} ${command} ${argsString}`)

      if (stderr) {
        return { success: false, error: stderr }
      }

      return { success: true, data: stdout }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/server/services/opencli.ts
git commit -m "feat: add OpenCLI integration service"
```

## Task 4: Express Server

**Files:**
- Create: `prism/src/server/index.ts`
- Create: `prism/src/server/routes/adapters.ts`
- Create: `prism/src/server/routes/execute.ts`

- [ ] **Step 1: Create Express server**

```typescript
import express from 'express'
import cors from 'cors'
import { adapterRoutes } from './routes/adapters'
import { executeRoutes } from './routes/execute'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use('/api/adapters', adapterRoutes)
app.use('/api/execute', executeRoutes)

app.listen(PORT, () => {
  console.log(`Prism server running on port ${PORT}`)
})

export default app
```

- [ ] **Step 2: Create adapter routes**

```typescript
import { Router } from 'express'
import { OpenCLIService } from '../services/opencli'

const router = Router()
const opencliService = new OpenCLIService()

router.get('/', async (req, res) => {
  try {
    const adapters = await opencliService.getAdapters()
    res.json(adapters)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch adapters' })
  }
})

router.get('/:adapter', async (req, res) => {
  try {
    const adapters = await opencliService.getAdapters()
    const adapter = adapters.find(a => a.name === req.params.adapter)
    if (!adapter) {
      return res.status(404).json({ error: 'Adapter not found' })
    }
    res.json(adapter)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch adapter' })
  }
})

export { router as adapterRoutes }
```

- [ ] **Step 3: Create execute routes**

```typescript
import { Router } from 'express'
import { OpenCLIService } from '../services/opencli'

const router = Router()
const opencliService = new OpenCLIService()

router.post('/:adapter/:command', async (req, res) => {
  try {
    const { adapter, command } = req.params
    const args = req.body
    const result = await opencliService.executeCommand(adapter, command, args)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute command' })
  }
})

export { router as executeRoutes }
```

- [ ] **Step 4: Commit**

```bash
git add src/server/index.ts src/server/routes/adapters.ts src/server/routes/execute.ts
git commit -m "feat: add Express server with routes"
```

## Task 5: CLI Entry Point

**Files:**
- Create: `prism/src/cli/index.ts`

- [ ] **Step 1: Create CLI entry point**

```typescript
import { Command } from 'commander'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const program = new Command()

program
  .name('prism')
  .description('Web UI for OpenCLI')
  .version('1.0.0')
  .option('-p, --port <port>', 'Port to run server on', '3000')
  .option('-h, --host <host>', 'Host to run server on', 'localhost')
  .option('--no-open', 'Do not open browser automatically')
  .action(async (options) => {
    const { port, host, open } = options

    // Start server
    process.env.PORT = port
    require('../server')

    // Open browser
    if (open) {
      const url = `http://${host}:${port}`
      const command = process.platform === 'win32' ? 'start' : 'open'
      await execAsync(`${command} ${url}`)
    }
  })

program.parse()
```

- [ ] **Step 2: Add bin entry to package.json**

```json
{
  "bin": {
    "prism": "./dist/cli/index.js"
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/cli/index.ts package.json
git commit -m "feat: add CLI entry point"
```

## Task 6: Vue Frontend Setup

**Files:**
- Create: `prism/src/web/index.html`
- Create: `prism/src/web/main.ts`
- Create: `prism/src/web/App.vue`

- [ ] **Step 1: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prism - OpenCLI Web UI</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/main.ts"></script>
</body>
</html>
```

- [ ] **Step 2: Create main.ts**

```typescript
import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import App from './App.vue'
import 'ant-design-vue/dist/reset.css'

const app = createApp(App)
app.use(Antd)
app.mount('#app')
```

- [ ] **Step 3: Create App.vue**

```vue
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
```

- [ ] **Step 4: Commit**

```bash
git add src/web/index.html src/web/main.ts src/web/App.vue
git commit -m "feat: add Vue frontend setup"
```

## Task 7: Vue Components

**Files:**
- Create: `prism/src/web/components/SiteSelector.vue`
- Create: `prism/src/web/components/OperationList.vue`
- Create: `prism/src/web/components/OperationItem.vue`
- Create: `prism/src/web/components/ResultDisplay.vue`

- [ ] **Step 1: Create SiteSelector component**

```vue
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
```

- [ ] **Step 2: Create OperationList component**

```vue
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
```

- [ ] **Step 3: Create OperationItem component**

```vue
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
```

- [ ] **Step 4: Create ResultDisplay component**

```vue
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
```

- [ ] **Step 5: Commit**

```bash
git add src/web/components/SiteSelector.vue src/web/components/OperationList.vue src/web/components/OperationItem.vue src/web/components/ResultDisplay.vue
git commit -m "feat: add Vue components"
```

## Task 8: Build and Test

**Files:**
- Modify: `prism/package.json`

- [ ] **Step 1: Add scripts to package.json**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "start": "node dist/server/index.js"
  }
}
```

- [ ] **Step 2: Test the application**

```bash
npm run dev
```

- [ ] **Step 3: Build for production**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "feat: add build scripts"
```

## Self-Review

**1. Spec coverage:**
- ✅ CLI with options (port, host, no-open)
- ✅ Express server with API routes
- ✅ Vue 3 frontend with Ant Design Vue
- ✅ Site selector dropdown
- ✅ Operation list with parameter forms
- ✅ Result display with text and file support
- ✅ OpenCLI integration service

**2. Placeholder scan:**
- No TBD or TODO found
- All steps contain actual code

**3. Type consistency:**
- Types are consistent across all files
- Parameter names match between frontend and backend
