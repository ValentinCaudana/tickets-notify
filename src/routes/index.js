import { Router } from 'express'
import clubs from './clubs.routes.js'
import sales from './sales.routes.js'
import countries from './countries.routes.js'
import subscriptions from './subscriptions.routes.js'

const router = Router()
router.use('/clubs', clubs)
router.use('/sales', sales)
router.use('/countries', countries)
router.use('/subscriptions', subscriptions)

export default router
