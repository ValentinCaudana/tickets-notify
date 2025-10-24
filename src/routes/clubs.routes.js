import { Router } from 'express'
import { listClubs, getClub } from '../controllers/clubs.controller.js'

export const clubsRoutes = Router()

clubsRoutes.get('/', listClubs)
clubsRoutes.get('/:id', getClub)
