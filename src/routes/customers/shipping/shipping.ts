import { Router } from 'express'

import {
  create,
  edit,
  getAllByUser,
  getById,
  deleteShipping,
} from '../../../controllers/customers/shipping/shipping'

const router = Router()

router.post('/create', create)

router.get('/get/shipping/:shippingId', getById)

router.get('/get/all/:userId', getAllByUser)

router.put('/edit/:shippingId', edit)

router.put('/delete/:shippingId', deleteShipping)

export default router
