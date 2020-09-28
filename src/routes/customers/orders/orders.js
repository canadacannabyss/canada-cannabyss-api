const express = require('express');

const router = express.Router();
const uuidv4 = require('uuid/v4');
const multer = require('multer');

const multerConfig = require('../../../config/multer');

const GstHst = require('../../../utils/taxes/gstHst');

const Order = require('../../../models/order/Order');
const Shipping = require('../../../models/shipping/Shipping');
const Billing = require('../../../models/billing/Billings');
const PaymentMethod = require('../../../models/paymentMethod/PaymentMethod');
const Cart = require('../../../models/cart/Cart');
const PaymentReceipt = require('../../../models/paymentReceipt/PaymentReceipt');

router.get('/get/orders/user/:userId', async (req, res) => {
  const { userId } = req.params;
  Order.find({
    customer: userId,
    completed: true,
  })
    .populate({
      path: 'cart',
      model: Cart,
    })
    .populate({
      path: 'shippingAddress',
      model: Shipping,
    })
    .populate({
      path: 'billingAddress',
      model: Billing,
    })
    .populate({
      path: 'paymentMethod',
      model: PaymentMethod,
    })

    .then((orders) => {
      res.status(200).send(orders);
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
