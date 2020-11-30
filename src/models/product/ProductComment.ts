import mongoose from 'mongoose'
import { db } from '../../config/db/index'

const ProductCommentSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  stars: {
    type: Number,
    required: true,
  },
  likes: {
    type: Number,
    required: false,
  },
  dislikes: {
    type: Number,
    required: false,
  },
  replies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommentReply',
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

const ProductComment = db.model('ProductComment', ProductCommentSchema)

export default ProductComment
