import mongoose from 'mongoose'
import { db2 } from '../../config/db/index'

const CustomerReferralSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  referredCustomers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: false,
    },
  ],
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
    default: Date.now,
  },
  updatedOn: {
    type: Date,
    required: false,
  },
})

const CustomerReferral = db2.model('CustomerReferral', CustomerReferralSchema)

export default CustomerReferral
