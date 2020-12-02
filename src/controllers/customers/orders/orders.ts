import { Request, Response } from 'express'

import Order from '../../../models/order/Order'
import Shipping from '../../../models/shipping/Shipping'
import Billing from '../../../models/billing/Billings'
import PaymentMethod from '../../../models/paymentMethod/PaymentMethod'
import Cart from '../../../models/cart/Cart'
import Customer from '../../../models/customer/Customer'
import Coupon from '../../../models/coupon/Coupon'
import PostalService from '../../../models/postalService/postalService'

export async function getOrdersByUser(req: Request, res: Response) {
  const { userId } = req.params
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
      return res.status(200).send(orders)
    })
    .catch((err) => {
      console.log(err)
    })
}
