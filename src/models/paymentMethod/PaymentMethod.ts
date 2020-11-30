import mongoose from 'mongoose'
import { db } from '../../config/db/index'

const PaymentMethodSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  card: {
    provider: {
      type: String,
      required: false,
      default: null,
    },
    id: {
      type: String,
      required: false,
      default: null,
    },
  },
  cryptocurrency: {
    logo: {
      type: String,
      required: false,
      default: null,
    },
    symbol: {
      type: String,
      required: false,
      default: null,
    },
    name: {
      type: String,
      required: false,
      default: null,
    },
    customerAddress: {
      type: String,
      required: false,
      default: null,
    },
    companyAddress: {
      type: String,
      required: false,
      default: null,
    },
    discount: {
      type: {
        type: String,
        required: false,
        default: null,
      },
      amount: {
        type: Number,
        required: false,
        default: null,
      },
    },
  },
  eTransfer: {
    recipient: {
      type: String,
      required: false,
      default: null,
    },
    isETransfer: {
      type: Boolean,
      required: false,
      default: null,
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

const PaymentMethod = db.model('PaymentMethod', PaymentMethodSchema)

export default PaymentMethod
