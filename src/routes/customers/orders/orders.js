const express = require('express');
const router = express.Router();

const CustomerOrdersController = require('../../../controllers/customers/orders/orders')

router.get('/get/orders/user/:userId', CustomerOrdersController.getOrdersByUser);

module.exports = router;
