import { Router } from 'express'

import {
  index,
  update,
  getById,
  sendTrackingNumberStart,
  updateStatusPaid,
  updateStatusShipping,
} from '../../../controllers/reseller/orders/orders'

const router = Router()

router.get('', index)

router.get('/:orderId', getById)

router.put('/update/:orderId', update)

router.put('/update/status/shipping', updateStatusShipping)

router.put('/update/status/paid', updateStatusPaid)

router.post('/send/tracking-number/start', sendTrackingNumberStart)

export default router
