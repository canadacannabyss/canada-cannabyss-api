import { Router } from 'express'

import { index } from '../controllers/categories'

const router = Router()

router.get('', index)

export default router
