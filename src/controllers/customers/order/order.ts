import { Request, Response } from 'express'
import { v4 } from 'uuid'
import fetch from 'node-fetch'

import GstHst from '../../../utils/taxes/gstHst'
import PStRst from '../../../utils/taxes/pstRst'
import Order from '../../../models/order/Order'
import Cart from '../../../models/cart/Cart'
import Product from '../../../models/product/Product'
import Bundle from '../../../models/bundle/Bundle'
import Coupon from '../../../models/coupon/Coupon'
import Shipping from '../../../models/shipping/Shipping'
import Billing from '../../../models/billing/Billings'
import PaymentMethod from '../../../models/paymentMethod/PaymentMethod'
import PaymentReceipt from '../../../models/paymentReceipt/PaymentReceipt'
import Customer from '../../../models/customer/Customer'
import PostalService from '../../../models/postalService/postalService'
import PstRst from '../../../utils/taxes/pstRst'
import { post } from '../../../services/api/index'

const roundFloatNumber = (number) => {
  return Math.round((number + Number.EPSILON) * 100) / 100
}

export async function create(req: Request, res: Response) {
  const { userId, cartId } = req.body
  console.log('userId:', userId)
  console.log('cartId:', cartId)
  const newOrder = new Order({
    cart: cartId,
    customer: userId,
    shipping: {
      shippingHandling: 0,
      freeShippingApplied: false,
      status: {
        shipped: false,
        when: null,
        updated: false,
      },
    },
    shippingAddress: null,
    billingAddress: null,
    paymentMethod: null,
    subtotal: 0,
    totalBeforeTax: 0,
    gstHst: 0,
    pstRst: 0,
    total: 0,
    paid: false,
    completed: false,
  })

  newOrder
    .save()
    .then((order) => {
      return res.json(order)
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function getById(req: Request, res: Response) {
  const { orderId } = req.params
  Order.findOne({
    _id: orderId,
    completed: false,
  })
    .populate({
      path: 'paymentMethod',
      model: PaymentMethod,
    })
    .populate({
      path: 'billingAddress',
      model: Billing,
    })
    .populate({
      path: 'shippingAddress',
      model: Shipping,
    })
    .populate({
      path: 'cart',
      model: Cart,
      populate: {
        path: 'items',
        model: Product,
      },
    })
    .populate({
      path: 'cart',
      model: Cart,
      populate: {
        path: 'items',
        model: Bundle,
      },
    })
    .populate({
      path: 'coupon',
      model: Coupon,
    })
    .then((order) => {
      if (order === null) {
        return res.json(null)
      } else {
        return res.json(order)
      }
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function getByUser(req: Request, res: Response) {
  const { userId } = req.params
  Order.findOne({
    customer: userId,
    paid: false,
    completed: false,
  })
    .populate({
      path: 'paymentMethod',
      model: PaymentMethod,
    })
    .populate({
      path: 'billingAddress',
      model: Billing,
    })
    .populate({
      path: 'shippingAddress',
      model: Shipping,
    })
    .populate({
      path: 'cart',
      model: Cart,
      populate: {
        path: 'items',
        model: Product,
      },
    })
    .populate({
      path: 'cart',
      model: Cart,
      populate: {
        path: 'items',
        model: Bundle,
      },
    })
    .populate({
      path: 'coupon',
      model: Coupon,
    })
    .then((order) => {
      if (order === null) {
        return res.json(null)
      } else {
        return res.json(order)
      }
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function updateSubtotal(req: Request, res: Response) {
  const { orderId, subtotal } = req.body
  console.log('subtotal:', subtotal)

  try {
    const order = await Order.findOne({
      _id: orderId,
    })
      .populate({
        path: 'cart',
        model: Cart,
        populate: {
          path: 'items',
          model: Product,
        },
      })
      .populate({
        path: 'cart',
        model: Cart,
        populate: {
          path: 'items',
          model: Bundle,
        },
      })
      .populate({
        path: 'coupon',
        model: Coupon,
      })
      .populate({
        path: 'paymentMethod',
        model: PaymentMethod,
      })

    let couponValid = false
    let subtotalVar = subtotal

    if (order.coupon) {
      if (order.coupon.discount.type === 'percent') {
        console.log(
          'order.coupon.discount.amount:',
          order.coupon.discount.amount,
        )
        // Calculate discount based on the coupon discount percentage amount
        subtotalVar = subtotal - subtotal * (order.coupon.discount.amount / 100)
      }
      if (order.coupon.discount.type === 'cash') {
        subtotalVar = subtotal - order.coupon.discount.amount
      }
    }

    if (order.paymentMethod !== null) {
      if (order.paymentMethod.cryptocurrency !== null) {
        if (
          order.paymentMethod.cryptocurrency.discount.type === 'percentage' &&
          !isNaN(order.paymentMethod.cryptocurrency.discount.amount)
        ) {
          if (order.paymentMethod.cryptocurrency.discount.amount > 0) {
            // Calculate discount based on the cryptocurrency payment method discount percentage amount
            subtotalVar =
              subtotalVar -
              subtotalVar *
                (order.paymentMethod.cryptocurrency.discount.amount / 100)
          }
        }
      }
    }

    subtotalVar = Math.round((subtotalVar + Number.EPSILON) * 100) / 100
    console.log('subtotalVar:', parseFloat(subtotalVar.toFixed(2)))

    await Order.updateOne(
      {
        _id: orderId,
      },
      {
        subtotal: subtotalVar,
      },
      {
        runValidators: true,
      },
    )

    Order.findOne({
      _id: orderId,
    })
      .then((order) => {
        return res.status(200).send({
          subtotal: order.subtotal,
        })
      })
      .catch((err) => {
        console.log(err)
      })
  } catch (err) {
    console.log(err)
  }
}

export async function couponApply(req: Request, res: Response) {
  const { orderId, couponName } = req.body
  console.log(orderId, couponName)
  try {
    const coupon = await Coupon.findOne({
      couponName,
    })

    const order = await Order.findOne({
      _id: orderId,
    })

    const alreadyAppliedCouponOrder = await Order.findOne({
      customer: order.customer,
      coupon: {
        _id: coupon._id,
      },
    })

    const errors = []

    if (!coupon) {
      errors.push({
        error: 'Coupon does not exist.',
      })
    } else {
      if (coupon.quantity === 0) {
        errors.push({
          error: 'This coupon is unavailable.',
        })
      }
    }

    if (!order) {
      errors.push({
        error: 'Order does not exist.',
      })
    }

    if (alreadyAppliedCouponOrder) {
      errors.push({
        error: 'This coupon has already been applied.',
      })
    }

    console.log('errors:', errors)

    if (errors.length > 0) {
      res.status(404).send(errors)
    } else {
      Order.findOneAndUpdate(
        {
          _id: orderId,
        },
        {
          coupon: coupon._id,
          updatedOn: Date.now(),
        },
        {
          runValidators: true,
        },
      )
        .then((order) => {
          Coupon.findOne({
            _id: order.coupon,
          })
            .then((coupon) => {
              return res.status(200).send({
                coupon,
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
  } catch (err) {
    console.log(err)
  }
}

export async function updateShippingHandling(req: Request, res: Response) {
  const { orderId } = req.body

  try {
    const orderObj = await Order.findOne({
      _id: orderId,
    }).populate({
      path: 'shippingAddress',
      model: Shipping,
    })

    if (orderObj.shippingAddress !== null) {
      if (
        orderObj.shippingAddress.country === 'CA' &&
        orderObj.shippingAddress.provinceState === 'BC' &&
        orderObj.shippingAddress.city === 'VICTORIA'
      ) {
        await Order.findOneAndUpdate(
          {
            _id: orderId,
          },
          {
            'shipping.shippingHandling': 0,
            'shipping.freeShippingApplied': true,
            updatedOn: Date.now(),
          },
          {
            runValidators: true,
          },
        )
      } else {
        if (orderObj.subtotal >= 100) {
          await Order.findOneAndUpdate(
            {
              _id: orderId,
            },
            {
              'shipping.shippingHandling': 0,
              'shipping.freeShippingApplied': true,
              updatedOn: Date.now(),
            },
            {
              runValidators: true,
            },
          )
        } else {
          await Order.findOneAndUpdate(
            {
              _id: orderId,
            },
            {
              'shipping.shippingHandling': 15.0,
              'shipping.freeShippingApplied': false,
              updatedOn: Date.now(),
            },
            {
              runValidators: true,
            },
          )
        }
      }
    } else {
      await Order.findOneAndUpdate(
        {
          _id: orderId,
        },
        {
          'shipping.shippingHandling': 15.0,
          'shipping.freeShippingApplied': false,
          updatedOn: Date.now(),
        },
        {
          runValidators: true,
        },
      )
    }

    if (orderObj.coupon !== null) {
      if (orderObj.coupon.freeShipping) {
        await Order.findOneAndUpdate(
          {
            _id: orderId,
          },
          {
            'shipping.shippingHandling': 0,
            'shipping.freeShippingApplied': true,
            updatedOn: Date.now(),
          },
          {
            runValidators: true,
          },
        )
      }
    }

    const order = await Order.findOne({
      _id: orderId,
    })

    return res.status(200).send({
      shippingHandling: order.shipping.shippingHandling,
      freeShippingApplied: order.shipping.freeShippingApplied,
    })
  } catch (err) {
    console.log(err)
  }
}

export async function resetShippingHandling(req: Request, res: Response) {
  const { orderId } = req.body

  try {
    const orderObj = await Order.findOne({
      _id: orderId,
    }).populate({
      path: 'shippingAddress',
      model: Shipping,
    })

    await Order.findOneAndUpdate(
      {
        _id: orderId,
      },
      {
        'shipping.shippingHandling': roundFloatNumber(0),
        'shipping.freeShippingApplied': false,
        updatedOn: Date.now(),
      },
      {
        runValidators: true,
      },
    )

    const order = await Order.findOne({
      _id: orderId,
    })

    return res.status(200).send({
      shippingHandling: order.shipping.shippingHandling,
      freeShippingApplied: order.shipping.freeShippingApplied,
    })
  } catch (err) {
    console.log(err)
  }
}

export async function updateTotalBeforeTax(req: Request, res: Response) {
  const { orderId } = req.body

  try {
    const orderObj = await Order.findOne({
      _id: orderId,
    })

    await Order.findOneAndUpdate(
      {
        _id: orderId,
      },
      {
        totalBeforeTax: roundFloatNumber(
          orderObj.subtotal + orderObj.shipping.shippingHandling,
        ),
        updatedOn: Date.now(),
      },
      {
        runValidators: true,
      },
    )

    const order = await Order.findOne({
      _id: orderId,
    })

    return res.status(200).send({
      totalBeforeTax: order.totalBeforeTax,
    })
  } catch (err) {
    console.log(err)
  }
}

export async function updateTaxGstHst(req: Request, res: Response) {
  const { orderId } = req.body

  try {
    const orderObj = await Order.findOne({
      _id: orderId,
    })

    const gsthstTax = roundFloatNumber(
      new GstHst(orderObj.subtotal).calculateGstHst(),
    )

    await Order.findOneAndUpdate(
      {
        _id: orderId,
      },
      {
        gstHst: gsthstTax,
        updatedOn: Date.now(),
      },
      {
        runValidators: true,
      },
    )

    const order = await Order.findOne({
      _id: orderId,
    })

    return res.status(200).send({
      gstHst: order.gstHst,
    })
  } catch (err) {
    console.log(err)
  }
}

export async function updateTaxPstRst(req: Request, res: Response) {
  const { orderId } = req.body

  try {
    const orderObj = await Order.findOne({
      _id: orderId,
    }).populate({
      path: 'shippingAddress',
      model: Shipping,
    })

    if (orderObj.shippingAddress !== null) {
      const pstrstTax = roundFloatNumber(
        new PstRst(
          orderObj.shippingAddress.provinceState,
          orderObj.subtotal,
        ).calculatePstRst(),
      )

      await Order.findOneAndUpdate(
        {
          _id: orderId,
        },
        {
          pstRst: pstrstTax,
          updatedOn: Date.now(),
        },
        {
          runValidators: true,
        },
      )
    }

    const order = await Order.findOne({
      _id: orderId,
    })

    return res.status(200).send({
      pstRst: order.pstRst,
    })
  } catch (err) {
    console.log(err)
  }
}

export async function updateTotal(req: Request, res: Response) {
  const { orderId } = req.body

  try {
    const orderObj = await Order.findOne({
      _id: orderId,
    })

    const total = roundFloatNumber(
      orderObj.totalBeforeTax + orderObj.gstHst + orderObj.pstRst,
    )

    await Order.findOneAndUpdate(
      {
        _id: orderId,
      },
      {
        total: total,
        updatedOn: Date.now(),
      },
      {
        runValidators: true,
      },
    )

    const order = await Order.findOne({
      _id: orderId,
    })

    return res.status(200).send({
      total: order.total,
    })
  } catch (err) {
    console.log(err)
  }
}

export async function updateTotalCryptocurrency(req: Request, res: Response) {
  const { orderId, totalInCryptocurrency } = req.body

  try {
    await Order.findOneAndUpdate(
      {
        _id: orderId,
      },
      {
        totalInCryptocurrency: totalInCryptocurrency,
        updatedOn: Date.now(),
      },
      {
        runValidators: true,
      },
    )
      .then((order) => {
        return res.status(200).send({
          totalInCryptocurrency: order.totalInCryptocurrency,
        })
      })
      .catch((err) => {
        console.error(err)
      })
  } catch (err) {
    console.log(err)
  }
}

export async function updateShipping(req: Request, res: Response) {
  const { orderId, shippingAddressId } = req.body

  try {
    await Order.findOneAndUpdate(
      {
        _id: orderId,
      },
      {
        shippingAddress: shippingAddressId,
        updatedOn: Date.now(),
      },
      {
        runValidators: true,
      },
    )

    const order = await Order.findOne({
      _id: orderId,
    }).populate({
      path: 'shippingAddress',
      model: Shipping,
    })

    return res.status(200).send(order.shippingAddress)
  } catch (err) {
    console.log(err)
  }
}

export async function updateBilling(req: Request, res: Response) {
  const { orderId, billingAddressId } = req.body

  console.log('UPDATE orderId, billing:', orderId, billingAddressId)
  try {
    await Order.findOneAndUpdate(
      {
        _id: orderId,
      },
      {
        billingAddress: billingAddressId,
        updatedOn: Date.now(),
      },
      {
        runValidators: true,
      },
    )

    const order = await Order.findOne({
      _id: orderId,
    }).populate({
      path: 'billingAddress',
      model: Billing,
    })

    return res.status(200).send(order.billingAddress)
  } catch (err) {
    console.log(err)
  }
}

export async function updatePaymentMethod(req: Request, res: Response) {
  const { orderId, paymentMethodId } = req.body

  console.log('orderId, paymentMethodId:', orderId, paymentMethodId)
  try {
    await Order.findOneAndUpdate(
      {
        _id: orderId,
      },
      {
        paymentMethod: paymentMethodId,
        updatedOn: Date.now(),
      },
      {
        runValidators: true,
      },
    )

    const order = await Order.findOne({
      _id: orderId,
    }).populate({
      path: 'paymentMethod',
      model: PaymentMethod,
    })

    return res.status(200).send(order.paymentMethod)
  } catch (err) {
    console.log(err)
  }
}

export async function setGlobalVariable(req: Request, res: Response) {
  try {
    console.log(req.body)
    const { type, title } = req.body

    global.gConfigMulter.type = type
    global.gConfigMulter.title = title
    global.gConfigMulter.folder_name = global.gConfigMulter.title
    global.gConfigMulter.destination = `${global.gConfigMulter.type}/${global.gConfigMulter.folder_name}`

    return res.status(200).send({
      ok: true,
    })
  } catch (err) {
    console.error(err)
  }
}

export async function updateCompleted(req: Request, res: Response) {
  const { orderId, imageObj, totalInFiat } = req.body

  console.log('imageObj:', imageObj)
  console.log('imageObj[0]:', imageObj[0])

  try {
    await Order.findOneAndUpdate(
      {
        _id: orderId,
      },
      {
        completed: true,
        purchasedAt: Date.now(),
        paymentReceipt: imageObj[0],
        totalInCryptocurrency: totalInFiat,
        updatedOn: Date.now(),
      },
      {
        runValidators: true,
      },
    )

    const order = await Order.findOne({
      _id: orderId,
    }).populate({
      path: 'cart',
      model: Cart,
      populate: {
        path: 'cart.items',
        model: Product,
      },
    })

    console.log('order found on completed:', order.cart.items)

    order.cart.items.map(async (item) => {
      const productObj = await Product.findOne({
        _id: item._id,
      })

      await Product.findOneAndUpdate(
        {
          _id: item._id,
        },
        {
          howManyBought: productObj.howManyBought + item.quantity,
        },
        {
          runValidators: true,
        },
      )
      return productObj
    })

    const promisesHowManyBought = order.cart.items.map(async (item) => {
      const productObj = await Product.findOne({
        _id: item._id,
      })

      await Product.findOneAndUpdate(
        {
          _id: item._id,
        },
        {
          howManyBought: productObj.howManyBought + item.quantity,
        },
        {
          runValidators: true,
        },
      )
      return productObj
    })

    const resultsAsyncHowManyBought = await Promise.all(promisesHowManyBought)

    const customerOrders = await Order.find({
      customer: order.customer,
      completed: true,
      paid: true,
    })

    console.log('customerOrders:', customerOrders)

    console.log('customerOrders.length === 0:', customerOrders.length === 0)

    if (customerOrders.length === 0) {
      const addCreditToCustomerResponse = await post(
        `${process.env.USER_API_DOMAIN}/referral/customer/add/credit/on/buy`,
        {
          customerId: order.customer,
        },
      )
      console.log('addCreditToCustomerResponse:', addCreditToCustomerResponse)
    }

    return res.status(200).send(order.completed)
  } catch (err) {
    console.log(err)
  }
}

export async function uploadOrderPaymentReceiptMedia(
  req: Request,
  res: Response,
) {
  try {
    const { originalname: name, size, key, location: url = '' } = req.file
    const id = v4()

    console.log(name, size, key, url)

    const orderPaymentReceipt = await OrderPaymentReceipt.create({
      id,
      name,
      size,
      key,
      url,
    })

    return res.json(orderPaymentReceipt)
  } catch (err) {
    console.log(err)
  }
}

export async function createPaymentReceipt(req: Request, res: Response) {
  try {
    const { originalname: name, size, key, location: url = '' } = req.file
    const id = v4()

    const paymentReceipt = await PaymentReceipt.create({
      id,
      name,
      size,
      key,
      url,
    })

    return res.json(paymentReceipt)
  } catch (err) {
    console.log(err)
  }
}

export async function sendFinishedOrderStart(req: Request, res: Response) {
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

    const fetchSendOrderTrackingNumber = await fetch(
      `${process.env.USER_API_DOMAIN}/customers/send/finished-order`,
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
