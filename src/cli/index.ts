import { spawn } from 'child_process'
import { createServer } from 'http'
import { existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import open from 'open'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DEFAULT_PORT = 3000

function findOpenCLI(): string | null {
  const paths = [
    '/usr/local/bin/opencli',
    '/usr/bin/opencli',
    join(process.env.HOME || '', '.nvm/versions/node/v24.14.1/bin/opencli'),
  ]
  
  if (process.platform === 'darwin') {
    const nvmPath = join(process.env.HOME || '', '.nvm/versions/node')
    if (existsSync(nvmPath)) {
      const versions = readdirSync(nvmPath).filter(v => v.startsWith('v2'))
      for (const version of versions.sort().reverse()) {
        const opencliPath = join(nvmPath, version, 'bin', 'opencli')
        if (existsSync(opencliPath)) {
          return opencliPath
        }
      }
    }
  }
  
  for (const p of paths) {
    if (existsSync(p)) return p
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
