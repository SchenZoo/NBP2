import { JsonController, UseBefore } from 'routing-controllers'
import { passportJwtMiddleware } from '../middlewares/PassportJwtMiddleware'

@JsonController('/friend-request')
@UseBefore(passportJwtMiddleware)
export class FriendRequestController {}
