import { Request, Response } from 'express'
import NodeGeocoder from 'node-geocoder'
import fetch from 'node-fetch'

import GstHst from '../../../utils/taxes/gstHst'

import Customer from '../../../models/customer/Customer'
import CustomerProfileImage from '../../../models/customer/CustomerProfileImage'
import Order from '../../../models/order/Order'
import Shipping from '../../../models/shipping/Shipping'
import Billing from '../../../models/billing/Billings'
import PaymentMethod from '../../../models/paymentMethod/PaymentMethod'
import Cart from '../../../models/cart/Cart'
import Product from '../../../models/product/Product'
import ProductMedia from '../../../models/product/ProductMedia'
import Coupon from '../../../models/coupon/Coupon'
import PaymentReceipt from '../../../models/paymentReceipt/PaymentReceipt'
import PostalService from '../../../models/postalService/postalService'

export async function index(req: Request, res: Response) {
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
      console.log('orders:', orders)
      return res.status(200).send(orders)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function getById(req: Request, res: Response) {
  const { orderId } = req.params
  console.log('orderId:', orderId)
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
      console.log('order:', order)
      return res.status(200).send(order)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function getOrderCoordinates(req: Request, res: Response) {
  const { orderId } = req.params

  try {
    const orderObj = await Order.findOne({
      _id: orderId,
    })

    const options = {
      provider: 'google',
      apiKey: process.env.GOOGLE_MAPS_API_KEY,
    }

    const geocoder = NodeGeocoder(options)

    const resGeo = await geocoder.geocode(
      `${orderObj.shippingAddress.addresLine1} ${orderObj.shippingAddress.city} ${orderObj.shippingAddress.provinceState} ${orderObj.shippingAddress.country}`,
    )
    console.log('res geocoder:', resGeo)
    return res.json({ ok: true })
  } catch (err) {
    console.error(err)
  }
}

export async function update(req: Request, res: Response) {
  const { orderId } = req.params
  const { shipped, paid, canceled, trackingNumber, postalService } = req.body

  let currentPostalService
  if (postalService === '-') {
    const orderObj = await Order.findOne({
      _id: orderId,
    })

    currentPostalService = orderObj.tracking.postalService
  } else {
    currentPostalService = postalService
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
    },
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
        },
      )
        .then(() => {
          return res.status(200).send({
            ok: true,
          })
        })
        .catch((err) => {
          console.error(err)
        })
    })
    .catch((err) => {
      console.error(err)
    })
}

export async function updateShippingStatus(req: Request, res: Response) {
  const { orderId, newShippingStatus } = req.body

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
      },
    )

    const order = await Order.findOne({
      _id: orderId,
    })

    console.log('order:', order)

    return res.status(200).send({
      orderId: order._id,
      shipped: order.shipping.status.shipped,
      when: order.shipping.status.when,
      updated: order.shipping.status.updated,
    })
  } catch (err) {
    console.log(err)
  }
}

export async function updatePaidStatus(req: Request, res: Response) {
  const { orderId, newPaymentStatus } = req.body

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
      },
    )

    const order = await Order.findOne({
      _id: orderId,
    })

    console.log('order:', order)

    return res.status(200).send({
      orderId: order._id,
      paid: order.paid,
    })
  } catch (err) {
    console.log(err)
  }
}

export async function sendTracknigNumber(req: Request, res: Response) {
  const { orderId } = req.body

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
      })

    console.log('orderObj:', orderObj)

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
      },
    )

    const data = await fetchSendOrderTrackingNumber.json()

    if (data.ok) {
      return res.status(200).send({ ok: true })
    }
  } catch (err) {
    console.error(err)
  }
}
