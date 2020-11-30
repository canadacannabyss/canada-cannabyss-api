import mongoose from 'mongoose'
import { db2 } from '../../config/db/index'

const TemporaryResellerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: false,
  },
  isCanadaCannabyssTeam: {
    type: Boolean,
    required: false,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedOn: {
    type: Date,
    required: false,
  },
})

const TemporaryReseller = db2.model(
  'TemporaryReseller',
  TemporaryResellerSchema,
)

export default TemporaryReseller
