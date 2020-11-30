import { Router } from 'express'
const router = Router()

import {
  index,
  getById,
  getOrderCoordinates,
  sendTracknigNumber,
  update,
  updatePaidStatus,
  updateShippingStatus,
} from '../../../controllers/admin/orders/orders'

router.get('', index)

router.get('/:orderId', getById)

router.get('/:orderId/coordinates', getOrderCoordinates)

router.put('/update/:orderId', update)

router.put('/update/status/shipping', updateShippingStatus)

router.put('/update/status/paid', updatePaidStatus)

router.post('/send/tracking-number/start', sendTracknigNumber)

export default router
