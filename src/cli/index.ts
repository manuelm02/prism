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
    await import('../server/index.js')

    // Open browser
    if (open) {
      const url = `http://${host}:${port}`
      const command = process.platform === 'win32' ? 'start' : 'open'
      await execAsync(`${command} ${url}`)
    }
  })

program.parse()
