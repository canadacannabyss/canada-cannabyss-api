import mongoose from 'mongoose'
import aws from 'aws-sdk'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { db } from '../../config/db/index'

const s3 = new aws.S3()

const PromotionMediaSchema = new mongoose.Schema({
  id: String,
  name: String,
  size: Number,
  key: String,
  url: String,
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

PromotionMediaSchema.pre('save', function () {
  if (!this.url) {
    this.url = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${this.key}`
  }
})

PromotionMediaSchema.pre('remove', function () {
  if (process.env.STORAGE_TYPE === 's3') {
    return s3
      .deleteObject({
        Bucket: process.env.BUCKET_NAME,
        Key: this.key,
      })
      .promise()
      .then((response) => {
        console.log(response.status)
      })
      .catch((response) => {
        console.log(response.status)
      })
  }
  return promisify(fs.unlink)(
    path.resolve(__dirname, '..', '..', 'tmp', 'uploads', this.key),
  )
})

const PromotionMedia = db.model('PromotionMedia', PromotionMediaSchema)

export default PromotionMedia
