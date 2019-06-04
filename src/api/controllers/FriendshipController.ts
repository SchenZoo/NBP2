import { JsonController, UseBefore, Get, QueryParams, CurrentUser, Post, Param, Delete } from 'routing-controllers'
import { passportJwtMiddleware } from '../middlewares/PassportJwtMiddleware'
import { Pagination } from '../misc/QueryPagination'
import { IUser } from '../database/models/User'
import { FriendshipModel } from '../database/models/Friendship'
import { FriendRequestModel } from '../database/models/FriendRequest'
import { ConflictError } from '../errors/ConflictError'
import { removeAllListeners } from 'cluster'
import { NotificationModel } from '../database/models/Notification'
import { USER_PROFILE } from '../../constants/AppRoutes'

@JsonController('/friends')
@UseBefore(passportJwtMiddleware)
export class FriendshipController {
  @Get()
  public async getAll(@QueryParams() query: Pagination, @CurrentUser() user: IUser) {
    const friendships = FriendshipModel.find()
      .or([{ emiter: user.id }, { receiver: user.id }])
      .sort({ createdAt: -1 })
      .limit(query.take)
      .skip(query.skip)
    return friendships
  }

  @Post('/:id')
  public async create(@CurrentUser() user: IUser, @Param('id') id: string) {
    const friendship = await FriendshipModel.findOne().or([{ mario: user.id, luigi: id }, { mario: id, luigi: user.id }])
    const friendship1 = await FriendRequestModel.findOne().or([{ sender: id, receiver: user.id }, { sender: user.id, receiver: id }])

    const notify = new NotificationModel({
      text: 'Vas friend request je prihvacen.',
      relativeLink: USER_PROFILE(user.id),
      emitter: user.id,
      receiver: id,
    }).save()

    if (friendship1) {
      FriendRequestModel.deleteOne(friendship1)
      if (!friendship) {
        return await new FriendshipModel({ mario: id, luigi: user.id })
      } else {
        throw new ConflictError('Bratici mario i luigi su vec braca prijatelji!s')
      }
    } else {
      throw new ConflictError('No friend request sent.')
    }
  }

  @Delete('/:id')
  public async delete(@CurrentUser() user: IUser, @Param('id') id: string) {
    const friendship = await FriendshipModel.findOne({ id })

    if (friendship) {
      return friendship.remove()
    }
  }
}
