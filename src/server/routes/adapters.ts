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
