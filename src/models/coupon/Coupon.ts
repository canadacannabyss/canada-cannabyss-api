import mongoose from 'mongoose'
import { db } from '../../config/db/index'

const CouponSchema = new mongoose.Schema({
  reseller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reseller',
    required: true,
  },
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
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false,
    },
  ],
  bundles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bundle',
      required: false,
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
  seo: {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  organization: {
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
      },
    ],
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
        required: true,
      },
    ],
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
  createdAt: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  updatedOn: {
    type: Date,
    required: false,
  },
})

const Coupon = db.model('Coupon', CouponSchema)

export default Coupon
