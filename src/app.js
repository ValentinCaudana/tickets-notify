import express from 'express'
import cors from 'cors'
import routes from './routes/index.js'

export const createServer = () => {
  const app = express()
  app.use(cors())
  app.use(express.json())

  app.get('/health', (_req, res) => res.json({ ok: true }))
  app.use('/api', routes)

  // 404
  app.use((req, res) => res.status(404).json({ error: 'Not found' }))
  // error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err)
    res.status(500).json({ error: 'Internal error' })
  })

  return app
}
