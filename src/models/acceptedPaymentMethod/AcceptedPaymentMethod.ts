import mongoose from 'mongoose'
import { db } from '../../config/db/index'
import { IAcceptedPaymentMethod } from '../../interfaces/models/acceptedPaymentMethod/acceptedPaymentMethod'

const AcceptedPaymentMethodSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  type: {
    type: String,
    required: true,
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
    address: {
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

const AcceptedPaymentMethod = db.model<IAcceptedPaymentMethod>(
  'AcceptedPaymentMethod',
  AcceptedPaymentMethodSchema,
)

export default AcceptedPaymentMethod
