import { Router } from 'express'

import {
  index,
  create,
  deleteCoupon,
  getBySlug,
  validateCouponName,
  edit,
} from '../../../controllers/reseller/coupons/coupons'

const router = Router()

router.get('/get/all', index)

router.get('/validate/couponName/:couponName', validateCouponName)

router.get('/get/coupon/:slug', getBySlug)

router.post('/create', create)

router.put('/edit', edit)

router.put('/delete/coupon/:couponId', deleteCoupon)

export default router
