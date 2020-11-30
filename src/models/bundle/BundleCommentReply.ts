import mongoose from 'mongoose'
import { db } from '../../config/db/index'

const BundleCommentReplySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  bundle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bundle',
    required: true,
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    required: false,
  },
  dislike: {
    type: Number,
    required: false,
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

const BundleCommentReply = db.model(
  'BundleCommentReply',
  BundleCommentReplySchema,
)

export default BundleCommentReply
