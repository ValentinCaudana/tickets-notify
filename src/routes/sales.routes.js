import { Router } from 'express'
import { listSales, createSale } from '../controllers/sales.controller.js'
const r = Router()

r.get('/', listSales)         // GET /api/sales?clubId=fcb
r.post('/', createSale)       // POST /api/sales

export default r
