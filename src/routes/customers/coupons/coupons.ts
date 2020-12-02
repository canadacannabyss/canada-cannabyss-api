import { Router } from 'express'
import { get } from '../../../controllers/customers/coupons/coupons'

const router = Router()

router.get('/get/', get)

export default router
