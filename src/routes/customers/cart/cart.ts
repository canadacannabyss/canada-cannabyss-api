import { Router } from 'express'

import {
  create,
  getById,
  addItem,
  getByUser,
  removeItem,
  updateCompleted,
  updatePurchased,
} from '../../../controllers/customers/cart/cart'

const router = Router()

router.post('/create/cart', create)

router.get('/get/cart/user/:userId', getByUser)

router.get('/get/cart/:cartId', getById)

router.put('/add/item', addItem)

router.put('/remove/item', removeItem)

router.put('/update/completed', updateCompleted)

router.put('/update/purchased', updatePurchased)

export default router
