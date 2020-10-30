const express = require('express');
const router = express.Router();

const CustomerShippingController = require('../../../controllers/customers/shipping/shipping')

router.post('/create', CustomerShippingController.create);

router.get('/get/shipping/:shippingId', CustomerShippingController.getById);

router.get('/get/all/:userId', CustomerShippingController.getAllByUser);

router.put('/edit/:shippingId', CustomerShippingController.edit);

router.put('/delete/:shippingId', CustomerShippingController.delete);

module.exports = router;
