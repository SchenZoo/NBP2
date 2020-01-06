import { JsonController, Post, Body, Req, Get, NotFoundError } from 'routing-controllers'
import { UserModel } from '../database/models/User'
import jwt = require('jsonwebtoken')
import { RoleNames } from '../../constants/RoleNames'
import { ConflictError } from '../errors/ConflictError'
import { hashPassowrd } from '../misc/Hash'
import { UserValidator } from '../validators/UserValidator'

const TOKEN_EXPIRY_TIME = '31d'

@JsonController('/auth')
export class AuthController {
  @Post('/login')
  public async get(@Body() user: UserValidator) {
    const foundUser = await UserModel.findOne({ username: new RegExp(`^${user.username}$`, 'i') }).select('+password')
    if (foundUser) {
        if (foundUser.checkPassword(user.password)) {
          const payload = {
            id: foundUser.id,
          }
          const secret = process.env.JWT_SECRET
          const token = jwt.sign(payload, secret as string, {
            expiresIn: TOKEN_EXPIRY_TIME,
          })
          delete foundUser.password
          return { token, user: foundUser }
        }
    }
    throw new NotFoundError('User not found' )
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
        expiresIn: TOKEN_EXPIRY_TIME,
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
