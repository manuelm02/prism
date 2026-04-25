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
