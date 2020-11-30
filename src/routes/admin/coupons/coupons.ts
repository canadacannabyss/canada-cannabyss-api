import { Router } from 'express'
const router = Router()

import {
  create,
  deleteCoupon,
  edit,
  getCouponBySlug,
  index,
  validateCouponName,
} from '../../../controllers/admin/coupons/coupons'

router.get('/get/all', index)

router.get('/validate/couponName/:couponName', validateCouponName)

router.get('/get/coupon/:slug', getCouponBySlug)

router.post('/create', create)

router.put('/edit', edit)

router.put('/delete/coupon/:couponId', deleteCoupon)

export default router
