import { Router } from 'express'
import { listClubs, getClub } from '../controllers/clubs.controller.js'
const r = Router()

r.get('/', listClubs)        // GET /api/clubs?league=laliga
r.get('/:id', getClub)       // GET /api/clubs/fcb

export default r
