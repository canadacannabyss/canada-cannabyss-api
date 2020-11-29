import mongoose from 'mongoose'
import { db2 } from '../../config/db/index'

const CustomerRefreshTokenSchema = new mongoose.Schema({
  refreshToken: {
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
    default: Date.now,
  },
})

const CustomerRefreshToken = db2.model(
  'CustomerRefreshToken',
  CustomerRefreshTokenSchema,
)

export default CustomerRefreshToken
