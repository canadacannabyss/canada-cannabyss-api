const express = require('express');
const router = express.Router();

const AdminCouponController = require('../../../controllers/admin/coupons/coupons')

router.get('/get/all', AdminCouponController.index);

router.get('/validate/couponName/:couponName', AdminCouponController.validateCouponName);

router.get('/get/coupon/:slug', AdminCouponController.getCouponBySlug);

router.post('/create', AdminCouponController.create);

router.put('/edit', AdminCouponController.edit);

router.put('/delete/coupon/:couponId', AdminCouponController.delete);

module.exports = router;
