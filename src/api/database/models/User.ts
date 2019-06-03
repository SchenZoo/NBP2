import { hashSync, compareSync } from 'bcrypt'
import { Typegoose, prop, arrayProp, staticMethod, ModelType, instanceMethod, pre, Ref } from 'typegoose'
import mongoose from 'mongoose'
import { IsNotEmpty } from 'class-validator'

export class User extends Typegoose {
  @IsNotEmpty()
  @prop({ required: true, unique: true })
  username: string

  @IsNotEmpty()
  @prop({ required: true })
  password: string

  @arrayProp({ required: true, items: String })
  roles: string[]

  @staticMethod
  static async findByUsername(this: ModelType<User> & typeof User, username: string) {
    return this.findOne({
      username,
    })
  }
  @staticMethod
  static getPasswordHash(this: ModelType<User> & typeof User, password: string) {
    return hashSync(password, 8)
  }
  @instanceMethod
  checkPassword(this: InstanceType<ModelType<User>>, password: string) {
    return compareSync(password, this.password)
  }

  @instanceMethod
  hasRole(this: InstanceType<ModelType<User>>, role: string) {
    return this.roles.includes(role)
  }
}

export const UserModel = new User().getModelForClass(User, {
  schemaOptions: {
    timestamps: true,
  },
  existingMongoose: mongoose,
})
