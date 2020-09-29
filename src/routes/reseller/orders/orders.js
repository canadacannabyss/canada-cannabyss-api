const express = require('express');

const app = express();
const cors = require('cors');
const uuidv4 = require('uuid/v4');

const GstHst = require('../../../utils/taxes/gstHst');

app.use(cors());

const Customer = require('../../../models/customer/Customer');
const CustomerProfileImage = require('../../../models/customer/CustomerProfileImage');
const Order = require('../../../models/order/Order');
const Shipping = require('../../../models/shipping/Shipping');
const Billing = require('../../../models/billing/Billings');
const PaymentMethod = require('../../../models/paymentMethod/PaymentMethod');
const Cart = require('../../../models/cart/Cart');
const Coupon = require('../../../models/coupon/Coupon');
const PaymentReceipt = require('../../../models/paymentReceipt/PaymentReceipt');

// const authMiddleware = require('../../../middleware/auth');

// app.use(authMiddleware);

app.get('', async (req, res) => {
  Order.find({
    completed: true,
    'deletion.isDeleted': false,
  })
    .populate({
      path: 'customer',
      model: Customer,
      populate: {
        path: 'profileImage',
        model: CustomerProfileImage,
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
      path: 'paymentReceipt',
      model: PaymentReceipt,
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
  console.log('orderId:', orderId);
  Order.findOne({
    _id: orderId,
    'deletion.isDeleted': false,
  })
    .populate({
      path: 'customer',
      model: Customer,
      populate: {
        path: 'profileImage',
        model: CustomerProfileImage,
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
      path: 'paymentReceipt',
      model: PaymentReceipt,
    })
    .populate({
      path: 'coupon',
      model: Coupon,
    })
    .then((order) => {
      console.log('order:', order);
      res.status(200).send(order);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.put('/update/:orderId', (req, res) => {
  const { orderId } = req.params;
  const { shipped, paid, canceled } = req.body;

  Order.findOneAndUpdate(
    {
      _id: orderId,
    },
    {
      'shipping.status.shipped': shipped,
      'shipping.status.when': Date.now(),
      'shipping.status.updated': true,
      canceled: canceled,
      paid: paid,
    },
    {
      runValidators: true,
    }
  )
    .then((updatedOrder) => {
      Cart.findOneAndUpdate(
        {
          _id: updatedOrder.cart,
        },
        {
          paid: paid,
        },
        {
          runValidators: true,
        }
      )
        .then(() => {
          res.status(200).send({
            ok: true,
          });
        })
        .catch((err) => {
          console.error(err);
        });
    })
    .catch((err) => {
      console.error(err);
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
