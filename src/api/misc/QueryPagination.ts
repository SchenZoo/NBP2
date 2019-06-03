import { IsInt, Min, Max, IsString, Allow, IsOptional } from 'class-validator'
import { Transform } from 'class-transformer'
import { HttpError } from 'routing-controllers'

export const DEFAULT_TAKE = 15
export const DEFAULT_SKIP = 0

export class Pagination {
  @Allow()
  @Transform(
    (value, obj, type) => {
      if (!value) {
        return DEFAULT_TAKE
      }
      if (isNaN(parseInt(value, 10))) {
        throw new HttpError(422, 'take must be number')
      }
      return value > 50 ? 50 : +value
    },
    { toClassOnly: true },
  )
  public take: number = DEFAULT_TAKE
  @Allow()
  @Transform(
    (value, obj, type) => {
      if (!value) {
        return DEFAULT_SKIP
      }
      if (isNaN(parseInt(value, 10))) {
        throw new HttpError(422, 'take must be number')
      }
      return value < 0 ? 0 : +value
    },
    { toClassOnly: true },
  )
  public skip: number = DEFAULT_SKIP
}

export class PaginationSearch extends Pagination {
  @IsOptional()
  @IsString()
  public name: string = ''
}
