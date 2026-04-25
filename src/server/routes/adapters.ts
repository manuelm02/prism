import { Router } from 'express'
import { OpenCLIService } from '../services/opencli'
import { siteConfigs } from '../../web/utils/adapter-config'

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

router.get('/sites', async (req, res) => {
  try {
    const sites = siteConfigs.map(site => ({
      id: site.id,
      name: site.name,
      icon: site.icon,
      description: site.description,
      commandCount: site.commands.length
    }))
    res.json(sites)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sites' })
  }
})

router.get('/sites/:site', async (req, res) => {
  try {
    const { site } = req.params
    const siteConfig = siteConfigs.find(s => s.id === site)
    if (!siteConfig) {
      return res.status(404).json({ error: 'Site not found' })
    }
    res.json(siteConfig)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch site' })
  }
})

export { router as adapterRoutes }
