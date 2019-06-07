import { ConnectionOptions } from 'mongoose'

const server = process.env.MONGO_HOSTNAME + ':' + process.env.MONGO_PORT
const database = process.env.MONGO_DB

export const MONGO_URL = `mongodb://${server}/${database}`
export const MONGO_CONNECTION_OPTIONS = {
  useNewUrlParser: true,
  useCreateIndex: true,
  poolSize: 5,
  user: process.env.MONGO_USERNAME,
  pass: process.env.MONGO_PASSWORD,
  authSource: process.env.MONGO_SOURCE,
  useFindAndModify: false,
} as ConnectionOptions
