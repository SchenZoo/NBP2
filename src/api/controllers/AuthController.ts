import { JsonController, Post, Body, Req } from 'routing-controllers'
import { User, UserModel } from '../database/models/User'
import jwt = require('jsonwebtoken')
import { RoleNames } from '../../constants/RoleNames'
import { ConflictError } from '../errors/ConflictError'
import { Request } from 'express'

@JsonController('/auth')
export class AuthController {
  @Post('/login')
  public async get(@Body({ validate: { whitelist: true } }) user: User, @Req() req: Request) {
    const foundUser = await UserModel.findOne({ username: user.username })
    if (foundUser) {
      try {
        if (foundUser.checkPassword(user.password)) {
          const payload = {
            id: foundUser.id,
          }
          const secret = process.env.JWT_SECRET
          const token = jwt.sign(payload, secret as string, {
            expiresIn: '31d',
          })
          return { token, user: foundUser }
        } else {
          return { message: 'Login failed.' }
        }
      } catch (e) {
        return { error: e.message }
      }
    }
    return { error: 'User not found' }
  }

  @Post('/register')
  public async save(@Body({ validate: { whitelist: true } }) user: User) {
    user.password = UserModel.getPasswordHash(user.password)
    user.roles = [RoleNames.PARTICIPANT]
    const newUser = new UserModel(user)
    try {
      const saved = await newUser.save()
      const payload = {
        id: saved.id,
      }
      const secret = process.env.JWT_SECRET
      const token = jwt.sign(payload, secret as string, {
        expiresIn: '31d',
      })
      return {
        token,
        user: saved,
      }
    } catch (e) {
      throw new ConflictError('User with this email already exists')
    }
  }
}
