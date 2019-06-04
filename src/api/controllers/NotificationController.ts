import { JsonController, UseBefore, Get, QueryParam, QueryParams, CurrentUser, Body, Put, Req } from 'routing-controllers'
import { passportJwtMiddleware } from '../middlewares/PassportJwtMiddleware'
import { Pagination } from '../misc/QueryPagination'
import { IUser } from '../database/models/User'
import { NotificationModel } from '../database/models/Notification'
import { NotificationPolicy } from '../policy/NotificationPolicy'
import { policyCheck } from '../middlewares/AuthorizationMiddlewares'
import { BASE_POLICY_NAMES } from '../policy/BasePolicy'
import { INotificationRequest } from '../interface/INotificationRequest'

@JsonController('/notification')
@UseBefore(passportJwtMiddleware)
export class NotificationController {
  @Get()
  public async get(@QueryParams() query: Pagination, @CurrentUser() user: IUser) {
    const notifications = NotificationModel.find({ receiver: user.id })
      .sort({ createdAt: -1 })
      .limit(query.take)
      .skip(query.skip)
  }

  @Put('/:id')
  @UseBefore(policyCheck(BASE_POLICY_NAMES.UPDATE, NotificationPolicy))
  public async openNotification(@Req() request: INotificationRequest) {
    request.notification.openedAt = new Date()
  }
}
