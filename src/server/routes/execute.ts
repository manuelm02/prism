import { Router } from 'express'
import { OpenCLIService } from '../services/opencli'

const router = Router()
const opencliService = new OpenCLIService()

// 站点命令执行路由 - 必须放在 :adapter/:command 之前
router.post('/:site/execute', async (req, res) => {
  try {
    const { site } = req.params
    const { command, params } = req.body
    console.log(`[API] POST /api/sites/${site}/execute`, { command, params })
    const result = await opencliService.executeSiteCommand(site, command, params || {})
    res.json(result)
  } catch (error) {
    console.error('[API] Error:', error)
    res.status(500).json({ error: 'Failed to execute command', message: (error as Error).message })
  }
})

// 旧版适配器命令执行路由
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
