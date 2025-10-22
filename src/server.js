import express from 'express'

const app = express()
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))

// Ruta de verificación directa (sin router, para aislar)
import { listClubs } from './controllers/clubs.controller.js'
app.get('/api/clubs', listClubs)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`))
