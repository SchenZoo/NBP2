import { JsonController, Post, Body, Req, Get } from 'routing-controllers'
import { IUser, UserModel } from '../database/models/User'
import jwt = require('jsonwebtoken')
import { RoleNames } from '../../constants/RoleNames'
import { ConflictError } from '../errors/ConflictError'
import { hashPassowrd } from '../misc/Hash'
import { UserValidator } from '../validators/UserValidator'

@JsonController('/auth')
export class AuthController {
  @Post('/login')
  public async get(@Body() user: UserValidator) {
    const foundUser = await UserModel.findOne({ username: user.username }).select('+password')
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
          foundUser.password = ''
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
  public async save(@Body() user: UserValidator) {
    user.password = hashPassowrd(user.password)
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
      saved.password = ''
      return {
        token,
        user: saved,
      }
    } catch (e) {
      throw new ConflictError('User with this email already exists')
    }
  }
}
