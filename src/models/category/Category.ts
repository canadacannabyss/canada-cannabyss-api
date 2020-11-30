import mongoose from 'mongoose'
import { db } from '../../config/db/index'

const CategorySchema = new mongoose.Schema({
  media: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CategoryMedia',
    required: false,
    default: null,
  },
  reseller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reseller',
    required: false,
    default: null,
  },
  categoryName: {
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
      default: '',
    },
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

const Category = db.model('Category', CategorySchema)

export default Category
