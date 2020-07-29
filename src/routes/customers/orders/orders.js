const express = require('express');

const app = express();
const cors = require('cors');
const uuidv4 = require('uuid/v4');

const GstHst = require('../../../utils/taxes/gstHst');

app.use(cors());

const Order = require('../../../models/order/Order');
const Shipping = require('../../../models/shipping/Shipping');
const Billing = require('../../../models/billing/Billings');
const PaymentMethod = require('../../../models/paymentMethod/PaymentMethod');
const Cart = require('../../../models/cart/Cart');

// const authMiddleware = require('../../../middleware/auth');

// app.use(authMiddleware);

app.get('/get/orders/user/:userId', async (req, res) => {
  const { userId } = req.params;
  Order.find({
    user: userId,
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

module.exports = app;
