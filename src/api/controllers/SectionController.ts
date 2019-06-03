import { JsonController, UseBefore, Get } from 'routing-controllers'
import { passportJwtMiddleware } from '../middlewares/PassportJwtMiddleware'
import { checkRole } from '../middlewares/AuthorizationMiddleware'
import { RoleNames } from '../../constants/RoleNames'

@JsonController('/section')
@UseBefore(passportJwtMiddleware)
export class SectionController {
  @Get()
  @UseBefore(checkRole(RoleNames.ADMIN))
  a() {}
}
