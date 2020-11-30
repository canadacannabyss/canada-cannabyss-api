import mongoose from 'mongoose'
import aws from 'aws-sdk'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { db2 } from '../../config/db/index'

const s3 = new aws.S3()

const UserProfileImageSchema = new mongoose.Schema({
  id: String,
  name: String,
  size: Number,
  key: String,
  url: String,
  origin: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedOn: {
    type: Date,
    required: false,
  },
})

UserProfileImageSchema.pre('save', function () {
  if (this.origin !== 'Github') {
    if (!this.url) {
      this.url = `${process.env.APP_URL}/files/${this.key}`
    }
  }
})

UserProfileImageSchema.pre('remove', function () {
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

export default db2.model('UserProfileImage', UserProfileImageSchema)
