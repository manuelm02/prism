import { spawnSync } from 'child_process'
import { createServer } from 'http'
import { existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import open from 'open'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DEFAULT_PORT = 3000

/**
 * 搜索 OpenCLI 安装路径
 * 支持: mise / nvm / fnm / 系统全局安装 / PATH 查找
 */
function findOpenCLI(): string | null {
  // 1. 优先使用环境变量指定的路径
  if (process.env.OPENCLI_PATH && existsSync(process.env.OPENCLI_PATH)) {
    return process.env.OPENCLI_PATH
  }

  // 2. 搜索版本管理器的安装目录
  const home = process.env.HOME || ''
  const versionManagerDirs = [
    // mise (https://mise.jdx.dev)
    join(home, '.local', 'share', 'mise', 'installs', 'node'),
    // nvm
    join(home, '.nvm', 'versions', 'node'),
    // fnm
    join(home, '.fnm', 'node_versions'),
    // asdf
    join(home, '.asdf', 'installs', 'nodejs'),
  ]

  for (const baseDir of versionManagerDirs) {
    if (!existsSync(baseDir)) continue
    try {
      const versions = readdirSync(baseDir).filter(v => v.startsWith('v'))
      // 按版本号降序排列，优先使用最新版本
      for (const version of versions.sort().reverse()) {
        const binDirs = [
          join(baseDir, version, 'bin', 'opencli'),          // mise / nvm / asdf
          join(baseDir, version, 'installation', 'bin', 'opencli'), // fnm
        ]
        for (const opencliPath of binDirs) {
          if (existsSync(opencliPath)) {
            return opencliPath
          }
        }
      }
    } catch {
      // 跳过无法读取的目录
    }
  }

  // 3. 检查常见系统路径
  const commonPaths = [
    '/usr/local/bin/opencli',
    '/usr/bin/opencli',
    '/opt/homebrew/bin/opencli',
  ]
  for (const p of commonPaths) {
    if (existsSync(p)) return p
  }

  // 4. 通过 which 命令查找（同步方式，正确读取输出）
  try {
    const result = spawnSync('which', ['opencli'], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    if (result.status === 0 && result.stdout) {
      const outputPath = result.stdout.trim()
      if (outputPath && existsSync(outputPath)) {
        return outputPath
      }
    }
  } catch {
    // which 命令不可用，忽略
  }

  // 5. 最后的兜底：假设 opencli 在 PATH 中
  // 通过 spawnSync 验证它是否可执行
  try {
    const result = spawnSync('opencli', ['--version'], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 5000,
    })
    if (result.status === 0) {
      return 'opencli'
    }
  } catch {
    // 验证失败
  }

  return null
}

function getStaticDir(): string {
  const possiblePaths = [
    join(__dirname, 'web'),
    join(__dirname, '..', 'web'),
  ]
  
  for (const p of possiblePaths) {
    if (existsSync(p)) return p
  }
  
  return join(__dirname, 'web')
}

async function startServer(port: number): Promise<void> {
  const opencliPath = findOpenCLI()
  if (!opencliPath) {
    console.error('错误: 未找到 OpenCLI，请先安装 OpenCLI')
    console.error('安装方法: npm install -g opencli')
    process.exit(1)
  }
  
  console.log(`检测到 OpenCLI: ${opencliPath}`)
  
  const staticDir = getStaticDir()
  if (!existsSync(staticDir)) {
    console.error(`错误: 静态文件目录不存在: ${staticDir}`)
    console.error('请先运行构建: npm run build')
    process.exit(1)
  }
  
  process.env.OPENCLI_PATH = opencliPath
  
  const express = (await import('express')).default
  const cors = (await import('cors')).default
  
  const app = express()
  
  app.use(cors())
  app.use(express.json())
  
  const { adapterRoutes } = await import('../server/routes/adapters.js')
  const { executeRoutes } = await import('../server/routes/execute.js')
  const { systemRoutes } = await import('../server/routes/system.js')
  
  app.use('/api/adapters', adapterRoutes)
  app.use('/api/execute', executeRoutes)
  app.use('/api/system', systemRoutes)
  app.use('/api/sites', adapterRoutes)
  app.use('/api/sites', executeRoutes)
  
  app.use(express.static(staticDir))
  
  // 处理所有未匹配的路由，返回 index.html（SPA 路由支持）
  app.use((_req, res) => {
    res.sendFile(join(staticDir, 'index.html'))
  })
  
  const server = createServer(app)
  
  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      console.log(`\n  🚀 Prism 已启动!\n`)
      console.log(`  ➜  本地地址:   http://localhost:${port}`)
      console.log(`  ➜  按 Ctrl+C 停止服务\n`)
      
      open(`http://localhost:${port}`).catch(() => {
        console.log(`  请手动打开浏览器访问: http://localhost:${port}`)
      })
      
      resolve()
    })
    
    server.on('error', (err: Error & { code?: string }) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`端口 ${port} 已被占用，尝试使用端口 ${port + 1}`)
        startServer(port + 1).then(resolve).catch(reject)
      } else {
        reject(err)
      }
    })
  })
}

const port = parseInt(process.env.PORT || String(DEFAULT_PORT), 10)

startServer(port).catch(err => {
  console.error('启动失败:', err)
  process.exit(1)
})

process.on('SIGINT', () => {
  console.log('\n正在停止 Prism...')
  process.exit(0)
})
