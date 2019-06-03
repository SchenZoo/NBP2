import { HttpError, UnauthorizedError, NotFoundError, BadRequestError, Middleware, ExpressErrorMiddlewareInterface } from 'routing-controllers'
import { ConflictError } from '../errors/ConflictError'
import { Request, Response } from 'express'

@Middleware({ type: 'after' })
export class GlobalErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: any, request: Request, response: Response, next: (err?: any) => any) {
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
      default:
        response.status(500)
        break
    }
    return response.json(error)
  }
}
