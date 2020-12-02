import { Router } from 'express'
const router = Router()

import {
  index,
  getBtcPrice,
  getEthPrice,
  getPrice,
  getTotalCryptocurrency,
  validateSymbol,
  getCryptocurrencyiesFunction,
} from '../../controllers/cryptocurrencies/cryptocurrencies'

router.get('', index)

router.get('/get/cryptocurrencies', getCryptocurrencyiesFunction)

router.get('/get/eth/price', getEthPrice)

router.get('/get/btc/price', getBtcPrice)

router.get('/get/price', getPrice)

router.post('/get/total/cryptocurrency', getTotalCryptocurrency)

router.get('/validation/symbol/:symbol', validateSymbol)

export default router
