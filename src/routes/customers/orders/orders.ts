import { Router } from 'express'

import { getOrdersByUser } from '../../../controllers/customers/orders/orders'

const router = Router()

router.get('/get/orders/user/:userId', getOrdersByUser)

export default router
