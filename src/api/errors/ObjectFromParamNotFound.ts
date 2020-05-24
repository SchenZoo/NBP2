import { HttpError } from "routing-controllers";

export class ObjectFromParamNotFound extends HttpError {
  constructor(object: string, id: number | number[] | string | string[]) {
    let idAsArray: any[];
    idAsArray = typeof id === "number" || typeof id === "string" ? [id] : id;
    super(404, `${object} with id ${idAsArray.join()} cannot be found`);
    Object.setPrototypeOf(this, ObjectFromParamNotFound.prototype);
  }

  toJSON() {
    return {
      httpCode: this.httpCode,
      name: "ObjectFromParamNotFound",
      message: this.message,
    };
  }
}
