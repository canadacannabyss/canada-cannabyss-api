import { Router } from 'express'
const router = Router()

import { products } from '../../../controllers/customers/recommended/recommended'

router.get('/products', products)

export default router
