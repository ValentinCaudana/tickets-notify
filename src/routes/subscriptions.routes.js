import { Router } from 'express'
import { subscribeClub } from '../controllers/subscriptions.controller.js'
const r = Router()

r.post('/', subscribeClub) // { email or pushEndpoint, clubId }
export default r
