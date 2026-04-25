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
