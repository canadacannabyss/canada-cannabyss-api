import { Router } from 'express'

import {
  create,
  edit,
  getById,
  deleteBilling,
  getAllByUser,
} from '../../../controllers/customers/billing/biling'

const router = Router()

router.post('/create', create)

router.get('/get/billing/:billingId', getById)

router.get('/get/all/:userId', getAllByUser)

router.put('/edit/:billingId', edit)

router.put('/delete/:billingId', deleteBilling)

export default router
