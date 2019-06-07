import express = require('express')
import mongoose = require('mongoose')
import cors = require('cors')
import Container from 'typedi'
import { RoutingControllersOptions, useContainer as RoutingUseContainer, useExpressServer, Action } from 'routing-controllers'
import passport = require('passport')
import helmet = require('helmet')
import { MONGO_URL, MONGO_CONNECTION_OPTIONS } from './config/MongoDBOptions'
import { GlobalErrorHandler } from './api/middlewares/GlobalErrorHandler'
import { JwtStrategy } from './auth/JwtStrategy'
import models = require('./api/database/models/index')
import { JsonInterceptor } from './api/interceptors/JsonInterceptor'
console.log(models)

RoutingUseContainer(Container)
export const app: express.Application = express()
app.use('/public', express.static('public'))
app.use(cors())
app.use(helmet())
app.use(helmet.noCache())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize())
app.use(passport.session())
passport.use('jwt', JwtStrategy)

const port: number = (process.env.APP_PORT || 3000) as number
const appEnv: string = (process.env.APP_ENV || 'local') as string
app.set('port', port)
app.set('env', appEnv)

useExpressServer(app, {
  routePrefix: '/api',
  controllers: [`${__dirname}/api/controllers/**/*.ts`],
  middlewares: [GlobalErrorHandler],
  validation: true,
  defaults: { nullResultCode: 404, undefinedResultCode: 404 },
  development: appEnv !== 'prod',
  classTransformer: true,
  defaultErrorHandler: false,
  interceptors: [JsonInterceptor],
  currentUserChecker: (action: Action) => action.request.user,
} as RoutingControllersOptions)

mongoose
  .connect(MONGO_URL, MONGO_CONNECTION_OPTIONS)
  .then(res => {
    console.log('Connected to Mongo', MONGO_URL)
  })
  .catch(err => {
    console.log(err)
    console.error('Database connection error')
  })
