import { exec } from 'child_process'
import { promisify } from 'util'
import * as yaml from 'yaml'
import { Adapter, Command, ExecutionResult } from '../../utils/types'
import { getSiteConfig, getCommandConfig, buildOpenCLIArgs } from '../../web/utils/adapter-config'

const execAsync = promisify(exec)

function getOpenCLIPath(): string {
  if (process.env.OPENCLI_PATH) {
    return process.env.OPENCLI_PATH
  }
  return 'opencli'
}

export class OpenCLIService {
  async checkInstallation(): Promise<boolean> {
    try {
      await execAsync(`${getOpenCLIPath()} --version`)
      return true
    } catch {
      return false
    }
  }

  async getAdapters(): Promise<Adapter[]> {
    try {
      const { stdout } = await execAsync(`${getOpenCLIPath()} list --format json`)
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

      const { stdout, stderr } = await execAsync(`${getOpenCLIPath()} ${adapter} ${command} ${argsString}`)

      if (stderr) {
        return { success: false, error: stderr }
      }

      return { success: true, data: stdout }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  async executeSiteCommand(siteId: string, commandId: string, params: Record<string, any>): Promise<ExecutionResult> {
    try {
      const siteConfig = getSiteConfig(siteId)
      if (!siteConfig) {
        return { success: false, error: `Site '${siteId}' not found` }
      }

      const commandConfig = getCommandConfig(siteId, commandId)
      if (!commandConfig) {
        return { success: false, error: `Command '${commandId}' not found for site '${siteId}'` }
      }

      const argsString = buildOpenCLIArgs(commandConfig, params)
      
      const fullCommand = `${getOpenCLIPath()} ${siteId} ${commandConfig.opencliCommand} ${argsString}`.trim()
      
      console.log(`[OpenCLI] Executing: ${fullCommand}`)
      
      const { stdout, stderr } = await execAsync(fullCommand, { 
        maxBuffer: 1024 * 1024 * 10 
      })

      if (stderr && !stdout) {
        return { success: false, error: stderr }
      }

      const result: ExecutionResult = {
        success: true,
        type: commandConfig.outputType
      }

      if (commandConfig.outputType === 'file') {
        result.filePath = stdout.trim()
      } else {
        try {
          result.data = JSON.parse(stdout)
        } catch {
          try {
            const parsed = yaml.parse(stdout)
            result.data = parsed
          } catch {
            result.data = stdout
            result.type = 'text'
          }
        }
      }

      return result
    } catch (error) {
      const err = error as Error & { stderr?: string; stdout?: string }
      return { 
        success: false, 
        error: err.stderr || err.message,
        data: err.stdout
      }
    }
  }
}
