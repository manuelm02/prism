import express from 'express'
import cors from 'cors'
import { adapterRoutes } from './routes/adapters'
import { executeRoutes } from './routes/execute'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// API 路由
app.use('/api/adapters', adapterRoutes)
app.use('/api/execute', executeRoutes)
app.use('/api/sites', adapterRoutes)
app.use('/api/sites', executeRoutes)

app.listen(PORT, () => {
  console.log(`Prism server running on port ${PORT}`)
  console.log(`API available at http://localhost:${PORT}/api`)
})

export default app
