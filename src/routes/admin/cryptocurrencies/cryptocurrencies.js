const express = require('express');
const router = express.Router();

const AdminCryptocurrenciesController = require('../../../controllers/admin/cryptocurrencies/cryptocurrencies');

router.get('', AdminCryptocurrenciesController.index);

router.get('/get/cryptocurrencies', AdminCryptocurrenciesController.getCryptocurrencyies);

router.get('/get/eth/price', AdminCryptocurrenciesController.getEthPrice);

router.get('/get/btc/price', AdminCryptocurrenciesController.getBtcPrice);

router.get('/get/price', AdminCryptocurrenciesController.getPrice);

router.post('/get/total/cryptocurrency', AdminCryptocurrenciesController.getTotalCryptocurrency);

router.get('/validation/symbol/:symbol', AdminCryptocurrenciesController.validateSymbol);

router.get('/:symbol', AdminCryptocurrenciesController.symbol);

router.post('/create', AdminCryptocurrenciesController.create);

router.put('/delete/cryptocurrency/:id', AdminCryptocurrenciesController.delete);

module.exports = router;
