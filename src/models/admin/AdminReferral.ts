const mongoose = require('mongoose')
import { IAdminReferral } from '../../interfaces/models/admin/admin'
import { db2 } from '../../config/db/index'

const AdminReferralSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  referredAdmins: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedOn: {
    type: Date,
    required: false,
  },
})

const AdminReferral = db2.model<IAdminReferral>(
  'AdminReferral',
  AdminReferralSchema,
)

export default AdminReferral
