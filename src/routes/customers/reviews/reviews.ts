import { Router } from 'express'
const router = Router()

import { getAllReviewsByUser } from '../../../controllers/customers/reviews/reviews'

router.get('/user/:userId', getAllReviewsByUser)

export default router
