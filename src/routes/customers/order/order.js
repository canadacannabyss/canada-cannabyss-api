const express = require('express')
const router = express.Router()
const multer = require('multer')

const multerConfig = require('../../../config/multer/multerPaymentReceipt')

const CustomerOrderController = require('../../../controllers/customers/order/order')

router.post('/create/order', CustomerOrderController.create)

router.get('/get/order/:orderId', CustomerOrderController.getById)

router.get('/get/order/user/:userId', CustomerOrderController.getByUser)

router.put('/update/subtotal', CustomerOrderController.updateSubtotal)

router.put('/coupon/apply', CustomerOrderController.couponApply)

router.put(
  '/update/shipping/handling',
  CustomerOrderController.updateShippingHandling,
)

router.put(
  '/reset/shipping/handling',
  CustomerOrderController.resetShippingHandling,
)

router.put(
  '/update/total/before-tax',
  CustomerOrderController.updateTotalBeforeTax,
)

router.put('/update/tax/gsthst', CustomerOrderController.updateTaxGstHst)

router.put('/update/tax/pstrst', CustomerOrderController.updateTaxPstRst)

router.put('/update/total', CustomerOrderController.updateTotal)

router.put(
  '/update/total/cryptocurrency',
  CustomerOrderController.updateTotalCryptocurrency,
)

router.put('/update/shipping', CustomerOrderController.updateShipping)

router.put('/update/billing', CustomerOrderController.updateBilling)

router.put(
  '/update/payment-method',
  CustomerOrderController.updatePaymentMethod,
)

router.post('/set/global-variable', CustomerOrderController.setGlobalVariable)

router.put('/update/completed', CustomerOrderController.updateCompleted)

router.post(
  '/order-payment-receipt/publish/media',
  multer(multerConfig).single('file'),
  CustomerOrderController.uploadOrderPaymentReceiptMedia,
)

router.post(
  '/create/payment-receipt',
  multer(multerConfig).single('file'),
  CustomerOrderController.createPaymentReceipt,
)

router.post(
  '/send/finished-order/start',
  CustomerOrderController.sendFinishedOrderStart,
)

module.exports = router
