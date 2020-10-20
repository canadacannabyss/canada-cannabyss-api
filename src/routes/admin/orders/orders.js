const express = require('express');

const router = express.Router();
const NodeGeocoder = require('node-geocoder');
const fetch = require('node-fetch');

const GstHst = require('../../../utils/taxes/gstHst');

const Customer = require('../../../models/customer/Customer');
const CustomerProfileImage = require('../../../models/customer/CustomerProfileImage');
const Order = require('../../../models/order/Order');
const Shipping = require('../../../models/shipping/Shipping');
const Billing = require('../../../models/billing/Billings');
const PaymentMethod = require('../../../models/paymentMethod/PaymentMethod');
const Cart = require('../../../models/cart/Cart');
const Product = require('../../../models/product/Product');
const ProductMedia = require('../../../models/product/ProductMedia');
const Coupon = require('../../../models/coupon/Coupon');
const PaymentReceipt = require('../../../models/paymentReceipt/PaymentReceipt');
const PostalService = require('../../../models/postalService/postalService');

// const authMiddleware = require('../../../middleware/auth');

// router.use(authMiddleware);

router.get('', async (req, res) => {
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

router.get('/:orderId', async (req, res) => {
  const { orderId } = req.params;
  console.log('orderId:', orderId);
  Order.findOne({
    _id: orderId,
    'deletion.isDeleted': false,
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
    .populate({
      path: 'customer',
      model: Customer,
    })
    .populate({
      path: 'tracking.postalService',
      model: PostalService,
    })
    .then((order) => {
      console.log('order:', order);
      res.status(200).send(order);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get('/:orderId/coordinates', async (req, res) => {
  const { orderId } = req.params;

  try {
    const orderObj = await Order.findOne({
      _id: orderId,
    });

    const options = {
      provider: 'google',
      apiKey: process.env.GOOGLE_MAPS_API_KEY,
    };

    const geocoder = NodeGeocoder(options);

    const res = await geocoder.geocode(
      `${orderObj.shippingAddress.addresLine1} ${orderObj.shippingAddress.city} ${orderObj.shippingAddress.provinceState} ${orderObj.shippingAddress.country}`
    );
    console.log('res geocoder:', res);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
  }
});

router.put('/update/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const { shipped, paid, canceled, trackingNumber, postalService } = req.body;

  let currentPostalService;
  if (postalService === '-') {
    const orderObj = await Order.findOne({
      _id: orderId,
    });

    currentPostalService = orderObj.tracking.postalService;
  } else {
    currentPostalService = postalService;
  }

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
      updatedOn: Date.now(),
      'tracking.number': trackingNumber,
      'tracking.postalService': currentPostalService,
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
          updatedOn: Date.now(),
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

router.put('/update/status/shipping', async (req, res) => {
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
        updatedOn: Date.now(),
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

router.put('/update/status/paid', async (req, res) => {
  const { orderId, newPaymentStatus } = req.body;

  try {
    await Order.findOneAndUpdate(
      {
        _id: orderId,
      },
      {
        paid: newPaymentStatus,
        updatedOn: Date.now(),
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

router.post('/send/tracking-number/start', async (req, res) => {
  const { orderId } = req.body;

  try {
    const orderObj = await Order.findOne({
      _id: orderId,
    })
      .populate({
        path: 'customer',
        model: Customer,
      })
      .populate({
        path: 'cart',
        model: Cart,
      })
      .populate({
        path: 'tracking.postalService',
        model: PostalService,
      });

    console.log('orderObj:', orderObj);

    const fetchSendOrderTrackingNumber = await fetch(
      `${process.env.USER_API_DOMAIN}/admin/customers/send/tracking-number`,
      {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order: orderObj }),
      }
    );

    const data = await fetchSendOrderTrackingNumber.json();

    if (data.ok) {
      res.status(200).send({ ok: true });
    }
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
