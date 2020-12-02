import { Router } from 'express'
const router = Router()

import { bundleBundles, productProducts } from '../controllers/resellers'

router.get('/product/products/:userId', productProducts)

router.get('/bundle/bundles/:userId', bundleBundles)

export default router
