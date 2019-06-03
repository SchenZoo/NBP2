import { UserModel, User } from '../models/User'
import { RoleNames } from '../../../constants/RoleNames'
import mongoose = require('mongoose')
import 'reflect-metadata'
import dotenv = require('dotenv')
import path = require('path')
dotenv.config({ path: path.resolve('.env') })
import { MONGO_URL, MONGO_CONNECTION_OPTIONS } from '../../../config/MongoDBOptions'

function main() {
  ;(async () => {
    const admin = new UserModel({
      username: 'Admin',
      password: UserModel.getPasswordHash('admin123'),
      roles: [RoleNames.ADMIN],
    } as User)
    try {
      console.log(await admin.save(), 'created')
      process.exit(0)
    } catch (err) {
      console.log('You have already created this user')
      process.exit(0)
    }
  })()
}

mongoose
  .connect(MONGO_URL, MONGO_CONNECTION_OPTIONS)
  .then(res => {
    main()
  })
  .catch(err => {
    console.log(err)
    console.error('Database connection error')
  })
