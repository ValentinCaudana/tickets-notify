import { Router } from 'express'
import { listSales, createSale } from '../controllers/sales.controller.js'
const router = Router()

router.get('/', listSales)
router.post('/', createSale)

export default router
