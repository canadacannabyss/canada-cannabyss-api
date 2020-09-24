const mongoose = require('mongoose');

var db = mongoose.createConnection(process.env.ATLAS_URI_CANADA_CANNABYSS, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const OrderSchema = new mongoose.Schema({
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    required: false,
    default: null,
  },
  shipping: {
    shippingHandling: {
      type: Number,
      required: true,
      default: 0,
    },
    freeShippingApplied: {
      type: Boolean,
      required: true,
      default: false,
    },
    status: {
      shipped: {
        type: Boolean,
        required: false,
        default: false,
      },
      when: {
        type: Date,
        required: false,
        default: null,
      },
      updated: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
  },
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipping',
    required: false,
    default: null,
  },
  billingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Billing',
    required: false,
    default: null,
  },
  paymentMethod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentMethod',
    required: false,
    default: null,
  },
  subtotal: {
    type: Number,
    required: true,
    default: 0,
  },
  totalBeforeTax: {
    type: Number,
    required: true,
    default: 0,
  },
  gstHst: {
    type: Number,
    required: true,
    default: 0,
  },
  pstRst: {
    type: Number,
    required: true,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
    default: 0,
  },
  paid: {
    type: Boolean,
    required: true,
    default: false,
  },
  completed: {
    type: Boolean,
    required: false,
    default: false,
  },
  deletion: {
    isDeleted: {
      type: Boolean,
      required: false,
      default: false,
    },
    when: {
      type: Date,
      required: false,
    },
  },
  createdOn: {
    type: Date,
    required: false,
    default: Date.now(),
  },
  updatedOn: {
    type: Date,
    required: false,
  },
  purchasedAt: {
    type: Date,
    required: false,
    default: null,
  },
});

const Order = db.model('Order', OrderSchema);

module.exports = Order;
