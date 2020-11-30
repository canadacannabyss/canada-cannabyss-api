import mongoose from 'mongoose'
import { db } from '../../config/db/index'

const BannerSchema = new mongoose.Schema({
  reseller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reseller',
    required: true,
  },
  bannerName: {
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
  howManyViewed: {
    type: Number,
    required: true,
    default: 0,
  },
  promotions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Promotion',
      required: true,
    },
  ],
  featured: {
    type: Boolean,
    required: false,
    default: false,
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

const Banner = db.model('Banner', BannerSchema)

export default Banner
