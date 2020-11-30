import { Router } from 'express'
const router = Router()

import {
  create,
  index,
  deleteCryptocurrencies,
  getBtcPrice,
  getCryptocurrencyiesController,
  getEthPrice,
  getPrice,
  getTotalCryptocurrency,
  symbol,
  validateSymbol,
} from '../../../controllers/admin/cryptocurrencies/cryptocurrencies'

router.get('', index)

router.get('/get/cryptocurrencies', getCryptocurrencyiesController)

router.get('/get/eth/price', getEthPrice)

router.get('/get/btc/price', getBtcPrice)

router.get('/get/price', getPrice)

router.post('/get/total/cryptocurrency', getTotalCryptocurrency)

router.get('/validation/symbol/:symbol', validateSymbol)

router.get('/:symbol', symbol)

router.post('/create', create)

router.put('/delete/cryptocurrency/:id', deleteCryptocurrencies)

export default router
