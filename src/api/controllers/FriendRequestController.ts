import { JsonController, UseBefore, Get, QueryParams, CurrentUser, Params, Post, Param, Delete } from 'routing-controllers'
import { passportJwtMiddleware } from '../middlewares/PassportJwtMiddleware'
import { Pagination } from '../misc/QueryPagination'
import { IUser } from '../database/models/User'
import { FriendRequestModel } from '../database/models/FriendRequest'
import { ConflictError } from '../errors/ConflictError'
import { NotificationRepository } from '../repositories/NotificationRepository'
import { FriendshipModel } from '../database/models/Friendship'

@JsonController('/friend_requests')
@UseBefore(passportJwtMiddleware)
export class FriendRequestController {
  constructor(private notifyRepo: NotificationRepository) {}
  @Get()
  public async getAll(@QueryParams() query: Pagination, @CurrentUser() user: IUser) {
    return FriendRequestModel.paginate({ receiver: user.id }, { sort: { createdAt: -1 }, limit: query.take, offset: query.skip })
  }

  @Get('/sent')
  public async getAllSentRequests(@QueryParams() query: Pagination, @CurrentUser() user: IUser) {
    return FriendRequestModel.paginate({ sender: user.id }, { sort: { createdAt: -1 }, limit: query.take, offset: query.skip })
  }

  @Post('/:id')
  public async create(@CurrentUser() user: IUser, @Param('id') id: string) {
    const friendRequest = await FriendRequestModel.findOne().or([{ sender: id, receiver: user.id }, { sender: user.id, receiver: id }])

    if (friendRequest) {
      throw new ConflictError('Vec je poslat zahtev.')
    }
    const friendship = await FriendshipModel.findOne().or([{ mario: user.id, luigi: id }, { mario: id, luigi: user.id }])
    if (friendship) {
      throw new ConflictError('Vec su ortaci.')
    }
    this.notifyRepo.saveViaUser(`Imate novi friend request od ${user.username}.`, user, id)
    return await new FriendRequestModel({ sender: user.id, receiver: id }).save()
  }

  @Post('/:id/accept')
  public async acceptFriendRequest(@CurrentUser() user: IUser, @Param('id') id: string) {
    const friendRequest = await FriendRequestModel.findOne({ $or: [{ sender: id, receiver: user.id }, { sender: user.id, receiver: id }] })
    if (friendRequest) {
      friendRequest.remove()
      const friendship = await FriendshipModel.findOne().or([{ mario: user.id, luigi: id }, { mario: id, luigi: user.id }])
      if (!friendship) {
        this.notifyRepo.saveViaUser(`${user.username} je prihvatio zahtev za prijateljstvo.`, user, id)
        return await new FriendshipModel({ mario: id, luigi: user.id }).save()
      } else {
        throw new ConflictError('Bratici mario i luigi su vec braca prijatelji!')
      }
    } else {
      throw new ConflictError('No friend request sent.')
    }
  }

  @Delete('/:id')
  public async delete(@CurrentUser() user: IUser, @Param('id') id: string) {
    return FriendRequestModel.findByIdAndDelete(id)
  }
}
