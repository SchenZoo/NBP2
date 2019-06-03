import { Request, Response } from 'express'
import { User } from '../database/models/User'
import { UnauthorizedError } from 'routing-controllers'
import { ModelType } from 'typegoose'

export const checkRole = (role: string) => {
  return (request: Request, response: Response, next) => {
    const user = request.user as InstanceType<ModelType<User>>
    if (!user.hasRole(role)) {
      next(new UnauthorizedError("User doesn't have the right role for this action"))
    }
    next()
  }
}
