import mongoose, { Schema, Document } from 'mongoose'
import { compareSync } from 'bcrypt'
import { ModelName } from '../../../constants/ModelName'
import { DefaultImage } from '../../../constants/DefaultImages'
import mongoosePaginate = require('mongoose-paginate')

export interface IUser extends Document {
  username: string
  password: string
  email: string
  roles: string[]
  imageURL: string
  hasRoles(role: string[]): boolean
  checkPassword(password: string): boolean
}

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      required: true,
      type: String,
      select: false,
    },
    email: {
      type: String,
    },
    roles: [String],
    imageURL: {
      type: String,
      default: DefaultImage.USER_PROFILE,
      get: url => `${process.env.APP_HOST}:${process.env.APP_PORT}/public/${url}`,
    },
  },
  { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } },
)
userSchema.plugin(mongoosePaginate)
userSchema.methods.checkPassword = function(password: string): boolean {
  return compareSync(password, this.password)
}
userSchema.methods.hasRoles = function(roles: string[]): boolean {
  return roles.some(role => this.roles.includes(role))
}

export const UserModel = mongoose.model<IUser>(ModelName.USER, userSchema)
