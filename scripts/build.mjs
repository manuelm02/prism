import { build } from 'esbuild'
import { copyFileSync, mkdirSync, existsSync, cpSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

async function buildCLI() {
  await build({
    entryPoints: [join(rootDir, 'src/cli/index.ts')],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: join(rootDir, 'dist/cli/index.js'),
    banner: {
      js: '#!/usr/bin/env node'
    },
    external: ['express', 'cors', 'yaml', 'open'],
    minify: false
  })
  
  console.log('CLI built successfully')
}

async function buildServer() {
  await build({
    entryPoints: [join(rootDir, 'src/server/index.ts')],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: join(rootDir, 'dist/server/index.js'),
    external: ['express', 'cors', 'yaml'],
    minify: false
  })
  
  console.log('Server built successfully')
}

async function main() {
  if (!existsSync(join(rootDir, 'dist/cli'))) {
    mkdirSync(join(rootDir, 'dist/cli'), { recursive: true })
  }
  if (!existsSync(join(rootDir, 'dist/server'))) {
    mkdirSync(join(rootDir, 'dist/server'), { recursive: true })
  }
  
  await Promise.all([buildCLI(), buildServer()])
  
  if (existsSync(join(rootDir, 'dist/web'))) {
    cpSync(join(rootDir, 'dist/web'), join(rootDir, 'dist/cli/web'), { recursive: true })
    console.log('Static files copied to CLI')
  }
  
  console.log('Build complete!')
}

main().catch(err => {
  console.error('Build failed:', err)
  process.exit(1)
})
