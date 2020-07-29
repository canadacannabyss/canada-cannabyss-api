const mongoose = require('mongoose');

var db = mongoose.createConnection(process.env.ATLAS_URI_CANADA_CANNABYSS, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const CouponSchema = new mongoose.Schema({
  couponName: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  howManyViewed: {
    type: Number,
    required: true,
    default: 0,
  },
  description: {
    type: String,
    required: true,
    default: '',
  },
  availableAt: {
    type: String,
    required: true,
  },
  featured: {
    type: Boolean,
    required: false,
    default: false,
  },
  freeShipping: {
    type: Boolean,
    required: false,
    default: false,
  },
  quantity: {
    type: Number,
    required: true,
  },
  items: [
    {
      _id: {
        type: String,
        required: true,
      },
    },
  ],
  discount: {
    type: {
      type: String,
      required: true,
      default: 'percent',
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  updatedOn: {
    type: Date,
    required: false,
  },
});

const Coupon = db.model('Coupon', CouponSchema);

module.exports = Coupon;
