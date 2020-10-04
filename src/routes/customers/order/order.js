const express = require('express');

const router = express.Router();
const uuidv4 = require('uuid/v4');
const multer = require('multer');

const multerConfig = require('../../../config/multerPaymentReceipt');

const GstHst = require('../../../utils/taxes/gstHst');
const PStRst = require('../../../utils/taxes/pstRst');

const Order = require('../../../models/order/Order');

const Cart = require('../../../models/cart/Cart');

const Product = require('../../../models/product/Product');

const Bundle = require('../../../models/bundle/Bundle');

const Coupon = require('../../../models/coupon/Coupon');

const Shipping = require('../../../models/shipping/Shipping');

const Billing = require('../../../models/billing/Billings');

const PaymentMethod = require('../../../models/paymentMethod/PaymentMethod');

const PaymentReceipt = require('../../../models/paymentReceipt/PaymentReceipt');

const PstRst = require('../../../utils/taxes/pstRst');

const roundFloatNumber = (number) => {
  return Math.round((number + Number.EPSILON) * 100) / 100;
};

router.post('/create/order', async (req, res) => {
  const { userId, cartId } = req.body;
  console.log('userId:', userId);
  console.log('cartId:', cartId);
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
  });

  newOrder
    .save()
    .then((order) => {
      res.json(order);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get('/get/order/:orderId', async (req, res) => {
  const { orderId } = req.params;
  Order.findOne({
    _id: orderId,
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
      path: 'coupon',
      model: Coupon,
    })
    .then((order) => {
      if (order === null) {
        res.json(null);
      } else {
        res.json(order);
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get('/get/order/user/:userId', async (req, res) => {
  const { userId } = req.params;
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
      path: 'coupon',
      model: Coupon,
    })
    .then((order) => {
      if (order === null) {
        res.json(null);
      } else {
        res.json(order);
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

router.put('/update/subtotal', async (req, res) => {
  const { orderId, subtotal } = req.body;
  console.log('subtotal:', subtotal);

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
      });

    let couponValid = false;
    let subtotalVar = subtotal;

    if (order.coupon) {
      // order.cart.items.map((item) => {
      //   order.coupon.items.map((couponItem) => {
      //     console.log(
      //       'item._id !== couponItem._id:',
      //       item._id === couponItem._id
      //     );
      //     if (item._id === couponItem._id) {
      //       couponValid = true;
      //       return;
      //     }
      //   });
      // });

      // if (couponValid) {
      //   if (order.coupon.discount.type === 'percent') {
      //     subtotalVar = subtotal - subtotal / order.coupon.discount.amount;
      //   }
      //   if (order.coupon.discount.type === 'cash') {
      //     subtotalVar = subtotal - order.coupon.discount.amount;
      //   }
      // }

      if (order.coupon.discount.type === 'percent') {
        console.log(
          'order.coupon.discount.amount:',
          order.coupon.discount.amount
        );
        subtotalVar =
          subtotal - subtotal * (order.coupon.discount.amount / 100);
      }
      if (order.coupon.discount.type === 'cash') {
        subtotalVar = subtotal - order.coupon.discount.amount;
      }
    }

    subtotalVar = Math.round((subtotalVar + Number.EPSILON) * 100) / 100;
    console.log('subtotalVar:', subtotalVar);

    await Order.updateOne(
      {
        _id: orderId,
      },
      {
        subtotal: subtotalVar,
      },
      {
        runValidators: true,
      }
    );
    Order.findOne({
      _id: orderId,
    })
      .then((order) => {
        res.status(200).send({
          subtotal: order.subtotal,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
});

router.put('/coupon/apply', async (req, res) => {
  const { orderId, couponName } = req.body;
  console.log(orderId, couponName);
  try {
    const coupon = await Coupon.findOne({
      couponName,
    });

    const order = await Order.findOne({
      _id: orderId,
    });

    const errors = [];

    if (!coupon) {
      errors.push({
        error: 'Coupon does not exist.',
      });
    } else {
      if (coupon.quantity === 0) {
        errors.push({
          error: 'This coupon is inavailable.',
        });
      }
    }

    if (!order) {
      errors.push({
        error: 'Order does not exist.',
      });
    }

    if (errors.length > 0) {
      res.status(404).send(errors);
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
        }
      )
        .then((order) => {
          Coupon.findOne({
            _id: order.coupon,
          })
            .then((coupon) => {
              res.status(200).send({
                coupon,
              });
            })
            .catch((err) => {
              console.error(err);
            });
        })
        .catch((err) => {
          console.error(err);
        });
    }
  } catch (err) {
    console.log(err);
  }
});

router.put('/update/shipping/handling', async (req, res) => {
  const { orderId } = req.body;

  try {
    const orderObj = await Order.findOne({
      _id: orderId,
    }).populate({
      path: 'shippingAddress',
      model: Shipping,
    });

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
          }
        );
      } else {
        await Order.findOneAndUpdate(
          {
            _id: orderId,
          },
          {
            'shipping.shippingHandling': 8.99,
            'shipping.freeShippingApplied': false,
            updatedOn: Date.now(),
          },
          {
            runValidators: true,
          }
        );
      }
    } else {
      await Order.findOneAndUpdate(
        {
          _id: orderId,
        },
        {
          'shipping.shippingHandling': 8.99,
          'shipping.freeShippingApplied': false,
          updatedOn: Date.now(),
        },
        {
          runValidators: true,
        }
      );
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
          }
        );
      }
    }

    const order = await Order.findOne({
      _id: orderId,
    });

    res.status(200).send({
      shippingHandling: order.shipping.shippingHandling,
      freeShippingApplied: order.shipping.freeShippingApplied,
    });
  } catch (err) {
    console.log(err);
  }
});

router.put('/reset/shipping/handling', async (req, res) => {
  const { orderId } = req.body;

  try {
    const orderObj = await Order.findOne({
      _id: orderId,
    }).populate({
      path: 'shippingAddress',
      model: Shipping,
    });

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
      }
    );

    const order = await Order.findOne({
      _id: orderId,
    });

    res.status(200).send({
      shippingHandling: order.shipping.shippingHandling,
      freeShippingApplied: order.shipping.freeShippingApplied,
    });
  } catch (err) {
    console.log(err);
  }
});

router.put('/update/total/before-tax', async (req, res) => {
  const { orderId } = req.body;

  try {
    const orderObj = await Order.findOne({
      _id: orderId,
    });

    await Order.findOneAndUpdate(
      {
        _id: orderId,
      },
      {
        totalBeforeTax: roundFloatNumber(
          orderObj.subtotal + orderObj.shipping.shippingHandling
        ),
        updatedOn: Date.now(),
      },
      {
        runValidators: true,
      }
    );

    const order = await Order.findOne({
      _id: orderId,
    });

    res.status(200).send({
      totalBeforeTax: order.totalBeforeTax,
    });
  } catch (err) {
    console.log(err);
  }
});

router.put('/update/tax/gsthst', async (req, res) => {
  const { orderId } = req.body;

  try {
    const orderObj = await Order.findOne({
      _id: orderId,
    });

    const gsthstTax = roundFloatNumber(
      new GstHst(orderObj.subtotal).calculateGstHst()
    );

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
      }
    );

    const order = await Order.findOne({
      _id: orderId,
    });

    res.status(200).send({
      gstHst: order.gstHst,
    });
  } catch (err) {
    console.log(err);
  }
});

router.put('/update/tax/pstrst', async (req, res) => {
  const { orderId } = req.body;

  try {
    const orderObj = await Order.findOne({
      _id: orderId,
    }).populate({
      path: 'shippingAddress',
      model: Shipping,
    });

    if (orderObj.shippingAddress !== null) {
      const pstrstTax = roundFloatNumber(
        new PstRst(
          orderObj.shippingAddress.provinceState,
          orderObj.subtotal
        ).calculatePstRst()
      );

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
        }
      );
    }

    const order = await Order.findOne({
      _id: orderId,
    });

    res.status(200).send({
      pstRst: order.pstRst,
    });
  } catch (err) {
    console.log(err);
  }
});

router.put('/update/total', async (req, res) => {
  const { orderId } = req.body;

  try {
    const orderObj = await Order.findOne({
      _id: orderId,
    });

    const total = roundFloatNumber(
      orderObj.totalBeforeTax + orderObj.gstHst + orderObj.pstRst
    );

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
      }
    );

    const order = await Order.findOne({
      _id: orderId,
    });

    res.status(200).send({
      total: order.total,
    });
  } catch (err) {
    console.log(err);
  }
});

router.put('/update/total/cryptocurrency', async (req, res) => {
  const { orderId, totalInCryptocurrency } = req.body;

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
      }
    )
      .then((order) => {
        res.status(200).send({
          totalInCryptocurrency: order.totalInCryptocurrency,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  } catch (err) {
    console.log(err);
  }
});

router.put('/update/shipping', async (req, res) => {
  const { orderId, shippingAddressId } = req.body;

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
      }
    );

    const order = await Order.findOne({
      _id: orderId,
    }).populate({
      path: 'shippingAddress',
      model: Shipping,
    });

    res.status(200).send(order.shippingAddress);
  } catch (err) {
    console.log(err);
  }
});

router.put('/update/billing', async (req, res) => {
  const { orderId, billingAddressId } = req.body;

  console.log('UPDATE orderId, billing:', orderId, billingAddressId);
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
      }
    );

    const order = await Order.findOne({
      _id: orderId,
    }).populate({
      path: 'billingAddress',
      model: Billing,
    });

    res.status(200).send(order.billingAddress);
  } catch (err) {
    console.log(err);
  }
});

router.put('/update/payment-method', async (req, res) => {
  const { orderId, paymentMethodId } = req.body;

  console.log('orderId, paymentMethodId:', orderId, paymentMethodId);
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
      }
    );

    const order = await Order.findOne({
      _id: orderId,
    }).populate({
      path: 'paymentMethod',
      model: PaymentMethod,
    });

    res.status(200).send(order.paymentMethod);
  } catch (err) {
    console.log(err);
  }
});

router.put('/update/completed', async (req, res) => {
  const { orderId, imageObj, totalInFiat } = req.body;

  console.log('imageObj:', imageObj);
  console.log('imageObj[0]:', imageObj[0]);

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
      }
    );

    const order = await Order.findOne({
      _id: orderId,
    });

    res.status(200).send(order.completed);
  } catch (err) {
    console.log(err);
  }
});

router.post(
  '/order-payment-receipt/publish/media',
  multer(multerConfig).single('file'),
  async (req, res) => {
    try {
      const { originalname: name, size, key, location: url = '' } = req.file;
      const id = uuidv4();

      console.log(name, size, key, url);

      const orderPaymentReceipt = await OrderPaymentReceipt.create({
        id,
        name,
        size,
        key,
        url,
      });

      return res.json(orderPaymentReceipt);
    } catch (err) {
      console.log(err);
    }
  }
);

router.post(
  '/create/payment-receipt',
  multer(multerConfig).single('file'),
  async (req, res) => {
    try {
      const { originalname: name, size, key, location: url = '' } = req.file;
      const id = uuidv4();

      const paymentReceipt = await PaymentReceipt.create({
        id,
        name,
        size,
        key,
        url,
      });

      return res.json(paymentReceipt);
    } catch (err) {
      console.log(err);
    }
  }
);

module.exports = router;
