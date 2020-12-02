import express from 'express'
import multer from 'multer'

import multerConfig from '../../../config/multer/multerPaymentReceipt'
import {
  couponApply,
  updateTotalBeforeTax,
  updateTaxPstRst,
  updateTaxGstHst,
  updateSubtotal,
  updateShippingHandling,
  resetShippingHandling,
  create,
  getById,
  getByUser,
  updateCompleted,
  setGlobalVariable,
  createPaymentReceipt,
  sendFinishedOrderStart,
  updateBilling,
  updatePaymentMethod,
  updateShipping,
  updateTotal,
  updateTotalCryptocurrency,
  uploadOrderPaymentReceiptMedia,
} from '../../../controllers/customers/order/order'

const router = express.Router()

router.post('/create/order', create)

router.get('/get/order/:orderId', getById)

router.get('/get/order/user/:userId', getByUser)

router.put('/update/subtotal', updateSubtotal)

router.put('/coupon/apply', couponApply)

router.put('/update/shipping/handling', updateShippingHandling)

router.put('/reset/shipping/handling', resetShippingHandling)

router.put('/update/total/before-tax', updateTotalBeforeTax)

router.put('/update/tax/gsthst', updateTaxGstHst)

router.put('/update/tax/pstrst', updateTaxPstRst)

router.put('/update/total', updateTotal)

router.put('/update/total/cryptocurrency', updateTotalCryptocurrency)

router.put('/update/shipping', updateShipping)

router.put('/update/billing', updateBilling)

router.put('/update/payment-method', updatePaymentMethod)

router.post('/set/global-variable', setGlobalVariable)

router.put('/update/completed', updateCompleted)

router.post(
  '/order-payment-receipt/publish/media',
  multer(multerConfig).single('file'),
  uploadOrderPaymentReceiptMedia,
)

router.post(
  '/create/payment-receipt',
  multer(multerConfig).single('file'),
  createPaymentReceipt,
)

router.post('/send/finished-order/start', sendFinishedOrderStart)

export default router
