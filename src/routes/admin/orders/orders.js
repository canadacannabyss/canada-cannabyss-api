const express = require('express');

const app = express();
const cors = require('cors');
const uuidv4 = require('uuid/v4');

const GstHst = require('../../../utils/taxes/gstHst');

app.use(cors());

const User = require('../../../models/user/User');
const ProfileImage = require('../../../models/user/UserProfileImage');
const Order = require('../../../models/order/Order');
const Shipping = require('../../../models/shipping/Shipping');
const Billing = require('../../../models/billing/Billings');
const PaymentMethod = require('../../../models/paymentMethod/PaymentMethod');
const Cart = require('../../../models/cart/Cart');
const Coupon = require('../../../models/coupon/Coupon');

// const authMiddleware = require('../../../middleware/auth');

// app.use(authMiddleware);

app.get('', async (req, res) => {
  Order.find({
    completed: true,
  })
    .populate({
      path: 'user',
      model: User,
      populate: {
        path: 'profileImage',
        model: ProfileImage,
      },
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
    .populate({
      path: 'coupon',
      model: Coupon,
    })
    .then((orders) => {
      console.log('orders:', orders);
      res.status(200).send(orders);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/:orderId', async (req, res) => {
  const { orderId } = req.params;
  Order.findOne({
    _id: orderId,
  })
    .then((order) => {
      res.status(200).send(order);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.put('/update/status/shipping', async (req, res) => {
  const { orderId, newShippingStatus } = req.body;

  try {
    await Order.findOneAndUpdate(
      {
        _id: orderId,
      },
      {
        'shipping.status.shipped': newShippingStatus,
        'shipping.status.when': Date.now(),
        'shipping.status.updated': true,
      },
      {
        runValidators: true,
      }
    );

    const order = await Order.findOne({
      _id: orderId,
    });

    console.log('order:', order);

    res.status(200).send({
      orderId: order._id,
      shipped: order.shipping.status.shipped,
      when: order.shipping.status.when,
      updated: order.shipping.status.updated,
    });
  } catch (err) {
    console.log(err);
  }
});

app.put('/update/status/paid', async (req, res) => {
  const { orderId, newPaymentStatus } = req.body;

  try {
    await Order.findOneAndUpdate(
      {
        _id: orderId,
      },
      {
        paid: newPaymentStatus,
      },
      {
        runValidators: true,
      }
    );

    const order = await Order.findOne({
      _id: orderId,
    });

    console.log('order:', order);

    res.status(200).send({
      orderId: order._id,
      paid: order.paid,
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = app;
