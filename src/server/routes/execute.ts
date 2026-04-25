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

router.post('/sites/:site/execute', async (req, res) => {
  try {
    const { site } = req.params
    const { command, params } = req.body
    const result = await opencliService.executeSiteCommand(site, command, params || {})
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute command', message: (error as Error).message })
  }
})

export { router as executeRoutes }
