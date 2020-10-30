const express = require('express');
const router = express.Router();

const CustomerCartController = require('../../../controllers/customers/cart/cart')

router.post('/create/cart', CustomerCartController.create);

router.get('/get/cart/user/:userId', CustomerCartController.getByUser);

router.get('/get/cart/:cartId', CustomerCartController.getById);

router.put('/add/item', CustomerCartController.addItem);

router.put('/remove/item', CustomerCartController.removeItem);

router.put('/update/completed', CustomerCartController.updateCompleted);

router.put('/update/purchased', CustomerCartController.updatePurchased);

module.exports = router;
