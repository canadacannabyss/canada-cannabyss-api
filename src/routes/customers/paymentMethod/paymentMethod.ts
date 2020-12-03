import { Router } from 'express'
import {
  getAllByUser,
  createCryptocurrency,
  createETransfer,
  getCryptocurrencyReceiptByUser,
  getETransferReceiptByUser,
} from '../../../controllers/customers/paymentMethod/paymentMethod'

const router = Router()

router.get('/all/:userId', getAllByUser)

router.post('/e-transfer/create', createETransfer)

router.get(
  '/e-transfer/get/by/user/:userId/:recipient',
  getETransferReceiptByUser,
)

router.put('/e-transfer/set/order', async (req, res) => {
  const { orderId, paymentMethodId } = req.body
})

router.post('/cryptocurrency/create', createCryptocurrency)

router.get(
  '/cryptocurrency/get/by/user/:userId',
  getCryptocurrencyReceiptByUser,
)

router.put('/cryptocurrency/set/order', async (req, res) => {
  const { orderId, paymentMethodId } = req.body
})

export default router
