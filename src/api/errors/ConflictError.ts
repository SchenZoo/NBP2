import { HttpError } from 'routing-controllers'

export class ConflictError extends HttpError {
  constructor(message: string) {
    super(409, message)
    Object.setPrototypeOf(this, ConflictError.prototype)
  }

  toJSON() {
    return {
      httpCode: this.httpCode,
      name: 'ConflictError',
      message: this.message,
    }
  }
}
