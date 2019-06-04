import { HttpError } from 'routing-controllers'

export class ObjectFromParamNotFound extends HttpError {
  constructor(object: string, id: number | number[] | string | string[]) {
    let idAsArray: any[]
    if (typeof id === 'number' || typeof id === 'string') {
      idAsArray = [id]
    } else {
      idAsArray = id
    }
    super(404, `${object} with id ${idAsArray.join()} cannot be found`)
    Object.setPrototypeOf(this, ObjectFromParamNotFound.prototype)
  }

  toJSON() {
    return {
      httpCode: this.httpCode,
      name: 'ObjectFromParamNotFound',
      message: this.message,
    }
  }
}
