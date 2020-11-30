import mongoose from 'mongoose'
import { db2 } from '../../config/db/index'

const UserSchema = new mongoose.Schema({
  id: {
    type: String,
    require: true,
  },
  names: {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      require: true,
    },
  },
  email: {
    type: String,
    required: false,
  },
  username: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: false,
  },
  profileImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfileImage',
    required: false,
  },
  isAdmin: {
    type: Boolean,
    require: true,
  },
  isVerified: {
    type: Boolean,
    required: false,
    default: false,
  },
  origin: {
    type: String,
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

const User = db2.model('User', UserSchema)

export default User
