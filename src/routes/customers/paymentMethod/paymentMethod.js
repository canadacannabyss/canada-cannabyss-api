const express = require('express');
const router = express.Router();

const CustomerPaymentMethodController = require('../../../controllers/customers/paymentMethod/paymentMethod')

router.get('/all/:userId', CustomerPaymentMethodController.getAllByUser);

router.post('/e-transfer/create', CustomerPaymentMethodController.createETransfer);

router.get('/e-transfer/get/by/user/:userId/:recipient', CustomerPaymentMethodController.getETransferReceiptByUser);

router.put('/e-transfer/set/order', async (req, res) => {
  const { orderId, paymentMethodId } = req.body;
});

router.post('/cryptocurrency/create', CustomerPaymentMethodController.createCryptocurrency);

router.get('/cryptocurrency/get/by/user/:userId', CustomerPaymentMethodController.getCryptocurrencyReceiptByUser);

router.put('/cryptocurrency/set/order', async (req, res) => {
  const { orderId, paymentMethodId } = req.body;
});

module.exports = router;
