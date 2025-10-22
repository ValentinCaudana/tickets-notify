import { Router } from 'express'
import { listCountries } from '../controllers/countries.controller.js'
const r = Router()

r.get('/', listCountries) // GET /api/countries

export default r
