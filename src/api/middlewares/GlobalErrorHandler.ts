import { HttpError, UnauthorizedError, NotFoundError, BadRequestError, Middleware, ExpressErrorMiddlewareInterface } from 'routing-controllers'
import { ConflictError } from '../errors/ConflictError'
import { Request, Response } from 'express'
import { MongoError } from 'mongodb'
import { ValidationError } from 'class-validator'

@Middleware({ type: 'after' })
export class GlobalErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: any, request: Request, response: Response, next: (err?: any) => any) {
    switch (error.name) {
      case 'ValidationError':
        response.status(422)
        return response.json(error)
      default:
        break
    }
    switch (error.constructor) {
      case HttpError:
        response.status(400)
        break
      case UnauthorizedError:
        response.status(403)
        break
      case NotFoundError:
        response.status(404)
        break
      case ConflictError:
        response.status(409)
        break
      case BadRequestError:
        response.status(422)
        break
      case MongoError:
        console.log(error)
        return response.status(500).json({ message: 'Database error' })
      default:
        response.status(500)
        break
    }

    return response.json(error)
  }
}
