import mongoose from 'mongoose'

export const db = mongoose.createConnection(
  process.env.ATLAS_URI_CANADA_CANNABYSS,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  },
)

export const db2 = mongoose.createConnection(
  process.env.ATLAS_URI_CANADA_CANNABYSS_USER,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  },
)
