const express = require('express');
const router = express.Router();

const CryptocurrenciesController = require('../../controllers/cryptocurrencies/cryptocurrencies')

router.get('', CryptocurrenciesController.index);

router.get('/get/cryptocurrencies', CryptocurrenciesController.getCryptocurrencyies);

router.get('/get/eth/price', CryptocurrenciesController.getEthPrice);

router.get('/get/btc/price', CryptocurrenciesController.getBtcPrice);

router.get('/get/price', CryptocurrenciesController.getPrice);

router.post('/get/total/cryptocurrency', CryptocurrenciesController.getTotalCryptocurrency);

router.get('/validation/symbol/:symbol', CryptocurrenciesController.validateSymbol);

module.exports = router;
