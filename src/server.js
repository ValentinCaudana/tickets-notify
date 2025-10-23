import express from 'express'
import salesRoutes from './routes/sales.routes.js'

const app = express()
app.use(express.json())

app.use('/api/sales', salesRoutes)
app.get('/health', (_req, res) => res.json({ ok: true }))
app.listen(process.env.PORT ?? 4000, ()=> console.log('API on 4000'))

// Ruta de verificación directa (sin router, para aislar)
import { listClubs } from './controllers/clubs.controller.js'
app.get('/api/clubs', listClubs)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`))


import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.static(path.join(__dirname, 'public')))


import { startReminderJob } from './jobs/reminders.js'
startReminderJob()
