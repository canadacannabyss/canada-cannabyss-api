import express from 'express'
import path from 'path'

import { success } from './utils/logger/logger'
import middlewareConfig from './config/middlewares/middlewares'

require('dotenv').config()

import routes from './routes/index'

const app = express()

middlewareConfig(app)

app.use(
  '/files',
  express.static(path.resolve(__dirname, '.', 'tmp', 'uploads')),
)

routes(app)

const port = process.env.PORT || 5000

app.listen(port, () => {
  success(`${process.env.APP_NAME} is listening on port: ${process.env.PORT}`)
})
