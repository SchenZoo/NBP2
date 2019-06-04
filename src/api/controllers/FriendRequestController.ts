import { JsonController, UseBefore, Get, QueryParams, CurrentUser, Params, Post, Param, Delete } from 'routing-controllers'
import { passportJwtMiddleware } from '../middlewares/PassportJwtMiddleware'
import { Pagination } from '../misc/QueryPagination'
import { IUser } from '../database/models/User'
import { FriendRequestModel } from '../database/models/FriendRequest'
import { IsUppercase } from 'class-validator'
import { ConflictError } from '../errors/ConflictError'
import { NotificationModel } from '../database/models/Notification'
import { USER_PROFILE } from '../../constants/AppRoutes'

@JsonController('/friend_requests')
@UseBefore(passportJwtMiddleware)
export class FriendRequestController {
  @Get()
  public async getAll(@QueryParams() query: Pagination, @CurrentUser() user: IUser) {
    const frequests = FriendRequestModel.find({ receiver: user.id })
      .sort({ createdAt: -1 })
      .limit(query.take)
      .skip(query.skip)
    return frequests
  }

  @Post('/:id')
  public async create(@CurrentUser() user: IUser, @Param('id') id: string) {
    const friendship = await FriendRequestModel.find().or([{ sender: id, receiver: user.id }, { sender: user.id, receiver: id }])

    if (!friendship) {
      const notify = new NotificationModel({ text: 'Imate novi friend request.', relativeLink: USER_PROFILE(user.id), emitter: user.id, receiver: id }).save()
      return await new FriendRequestModel({ sender: user.id, receiver: id })
    } else {
      throw new ConflictError('Vec su ortaci.')
    }
  }

  @Delete('/:id')
  public async delete(@CurrentUser() user: IUser, @Param('id') id: string) {
    const friendship = await FriendRequestModel.findOne({ id })

    if (friendship) {
      return friendship.remove()
    }
  }
}
