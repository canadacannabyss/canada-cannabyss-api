import { Request } from 'express'
import multer from 'multer'
import path from 'path'
import crypto from 'crypto'
import aws from 'aws-sdk'
import multerS3 from 'multer-sharp-s3'

const storageTypes = {
  local: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, '..', 'tmp', 'uploads'))
    },
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err)

        file.key = `${hash.toString('hex')}-${file.originalname}`

        cb(null, file.key)
      })
    },
  }),
  s3: multerS3({
    Key: (req: Request, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err)

        const fileName = `${req.headers.authorization}/${hash.toString(
          'hex',
        )}-${file.originalname}`

        cb(null, fileName)
      })
    },
    s3: new aws.S3(),
    Bucket: process.env.BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    ACL: 'public-read',
  }),
}

export default {
  dest: path.resolve(__dirname, '..', 'tmp', 'uploads'),
  // storage: storageTypes[process.env.STORAGE_TYPE],
  storage: storageTypes['local'],
  limits: {
    fileSize: 150 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/pjpeg',
      'image/png',
      'image/gif',
      'video/avi',
      'video/mp4',
      'video/mov',
      'video/wmv',
    ]

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type.'))
    }
  },
}
