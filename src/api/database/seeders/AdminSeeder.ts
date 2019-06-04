import { UserModel, IUser } from '../models/User'
import { RoleNames } from '../../../constants/RoleNames'
import mongoose = require('mongoose')
import 'reflect-metadata'
import dotenv = require('dotenv')
import path = require('path')
dotenv.config({ path: path.resolve('.env') })
import { MONGO_URL, MONGO_CONNECTION_OPTIONS } from '../../../config/MongoDBOptions'
import { hashPassowrd } from '../../misc/Hash'

function main() {
  ;(async () => {
    const admin = new UserModel({
      username: 'Admin',
      password: hashPassowrd('asdlolasd'),
      roles: [RoleNames.ADMIN],
      email: 'stankovic.aleksandar@elfak.rs',
    } as IUser)
    try {
      console.log(await admin.save(), 'created')
      process.exit(0)
    } catch (err) {
      console.log(err)
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
