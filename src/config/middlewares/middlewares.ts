import { Application, urlencoded, json } from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import morgan from 'morgan'
import session from 'express-session'
import bodyParser from 'body-parser'

export default (app: Application): void => {
  app.use(
    bodyParser.json({
      limit: '50mb',
    }),
  )

  app.use(
    bodyParser.urlencoded({
      limit: '50mb',
      extended: true,
    }),
  )

  app.use(cors())

  app.use(json())

  app.use(
    urlencoded({
      extended: false,
    }),
  )

  mongoose.set('useFindAndModify', false)

  // Express session
  app.use(
    session({
      secret: 'secret',
      resave: false,
      saveUninitialized: false,
      // store: new MongoStore({
      //   mongooseConnection: mongoose.connection,
      //   collection: 'sessions',
      // }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24,
      },
    }),
  )

  // Switch file storage from development to production
  app.use(morgan('dev'))
}
