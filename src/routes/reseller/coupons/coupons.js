const express = require('express');
const router = express.Router();

const ResellerCouponsController = require('../../../controllers/reseller/coupons/coupons')

router.get('/get/all', ResellerCouponsController.index);

router.get('/validate/couponName/:couponName', ResellerCouponsController.validateCouponName);

router.get('/get/coupon/:slug', ResellerCouponsController.getBySlug);

router.post('/create', ResellerCouponsController.create);

router.put('/edit', ResellerCouponsController.edit);

router.put('/delete/coupon/:couponId', ResellerCouponsController.delete);

module.exports = router;
