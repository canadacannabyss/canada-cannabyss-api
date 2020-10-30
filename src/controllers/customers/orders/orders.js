const Order = require('../../../models/order/Order');
const Shipping = require('../../../models/shipping/Shipping');
const Billing = require('../../../models/billing/Billings');
const PaymentMethod = require('../../../models/paymentMethod/PaymentMethod');
const Cart = require('../../../models/cart/Cart');
const Customer = require('../../../models/customer/Customer');
const Coupon = require('../../../models/coupon/Coupon');
const PostalService = require('../../../models/postalService/postalService');

module.exports = {
  getOrdersByUser: async (req, res) => {
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
      .populate({
        path: 'customer',
        model: Customer,
      })
      .populate({
        path: 'coupon',
        model: Coupon,
      })
      .populate({
        path: 'tracking.postalService',
        model: PostalService,
      })
      .then((orders) => {
        return res.status(200).send(orders);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}