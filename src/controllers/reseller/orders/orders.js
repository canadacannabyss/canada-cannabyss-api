const fetch = require('node-fetch');

const Customer = require('../../../models/customer/Customer');
const CustomerProfileImage = require('../../../models/customer/CustomerProfileImage');
const Order = require('../../../models/order/Order');
const Shipping = require('../../../models/shipping/Shipping');
const Billing = require('../../../models/billing/Billings');
const PaymentMethod = require('../../../models/paymentMethod/PaymentMethod');
const Cart = require('../../../models/cart/Cart');
const Coupon = require('../../../models/coupon/Coupon');
const PaymentReceipt = require('../../../models/paymentReceipt/PaymentReceipt');
const PostalService = require('../../../models/postalService/postalService');

module.exports = {
  index: async (req, res) => {
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
        return res.status(200).send(orders);
      })
      .catch((err) => {
        console.log(err);
      });
  },

  getById: async (req, res) => {
    const { orderId } = req.params;

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
        return res.status(200).send(order);
      })
      .catch((err) => {
        console.log(err);
      });
  },

  update: async (req, res) => {
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
            return res.status(200).send({
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
  },

  updateStatusShipping: async (req, res) => {
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

      return res.status(200).send({
        orderId: order._id,
        shipped: order.shipping.status.shipped,
        when: order.shipping.status.when,
        updated: order.shipping.status.updated,
      });
    } catch (err) {
      console.log(err);
    }
  },

  updateStatusPaid: async (req, res) => {
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

      return res.status(200).send({
        orderId: order._id,
        paid: order.paid,
      });
    } catch (err) {
      console.log(err);
    }
  },

  sendTrackingNumberStart: async (req, res) => {
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
        `${process.env.USER_API_DOMAIN}/reseller/customers/send/tracking-number`,
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
        return res.status(200).send({ ok: true });
      }
    } catch (err) {
      console.error(err);
    }
  }
}