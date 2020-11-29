import mongoose from 'mongoose'
import { db } from '../../config/db/index'

const ShippingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  name: {
    first: {
      type: String,
      require: true,
    },
    last: {
      type: String,
      require: true,
    },
  },
  country: {
    type: String,
    required: true,
  },
  provinceState: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  addressLine1: {
    type: String,
    required: true,
  },
  addressLine2: {
    type: String,
    required: false,
    default: '',
  },
  postalCode: {
    type: String,
    required: true,
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
    required: true,
    default: Date.now(),
  },
  updatedOn: {
    type: Date,
    required: false,
  },
})

const Shipping = db.model('Shipping', ShippingSchema)

export default Shipping
