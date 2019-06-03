import { Request, Response } from 'express'
import { UnauthorizedError } from 'routing-controllers'
import { IUser } from '../database/models/User'
import { ObjectFromParamNotFound } from '../errors/ObjectFromParamNotFound'

export const checkRole = (role: string[] = []) => {
  return (request: Request, response: Response, next) => {
    const user = request.user as IUser
    if (!user.hasRoles(role)) {
      next(new UnauthorizedError("User doesn't have the right role for this action"))
    }
    next()
  }
}

export const policyCheck = (policyName: string, policyClassDecorator: any) => {
  return async (request: Request, response: Response, next) => {
    try {
      const tmp = await new policyClassDecorator(request)[policyName]()
      if (tmp) {
        return next()
      } else {
        next(new UnauthorizedError("User doesn't have permission for this action"))
      }
    } catch (error) {
      switch (error.constructor) {
        case ObjectFromParamNotFound:
          return next(error)
        default:
          return next(new UnauthorizedError('Error in policy class ' + policyClassDecorator.name + ':' + policyName))
      }
    }
  }
}
